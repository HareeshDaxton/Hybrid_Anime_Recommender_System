import os
import requests
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from config.path_config import *
from utils.helper import getAnimeFeame, getSynopsis
from pipelines.prediction_pipeline import recommendation_by_anime_name

app = Flask(__name__)
CORS(app)


# ─────────────────────────────
#  AniList batched image fetcher  (1 HTTP call for all N anime)
# ─────────────────────────────
def fetch_images_batch(anime_results):
    entries = [(i, a) for i, a in enumerate(anime_results) if a.get("anime_id")]
    if not entries:
        return {}

    var_decls   = ", ".join(f"$id{i}: Int" for i, _ in entries)
    alias_blocks = " ".join(
        f"a{i}: Media(idMal: $id{i}, type: ANIME) {{ coverImage {{ extraLarge large }} }}"
        for i, _ in entries
    )
    query = f"query ({var_decls}) {{ {alias_blocks} }}"
    variables = {f"id{i}": a["anime_id"] for i, a in entries}

    image_map = {}
    try:
        res = requests.post(
            "https://graphql.anilist.co",
            json={"query": query, "variables": variables},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=12,
        )
        if res.ok:
            data = res.json().get("data", {})
            for i, a in entries:
                media = data.get(f"a{i}") or {}
                img = media.get("coverImage") or {}
                url = img.get("extraLarge") or img.get("large")
                if url:
                    image_map[a["name"]] = url
    except Exception:
        pass

    # Jikan fallback for any missed
    missing = [a for _, a in entries if a["name"] not in image_map]
    for a in missing:
        try:
            jr = requests.get(f"https://api.jikan.moe/v4/anime/{a['anime_id']}", timeout=6)
            if jr.ok:
                img = jr.json().get("data", {}).get("images", {}).get("jpg", {})
                url = img.get("large_image_url") or img.get("image_url")
                if url:
                    image_map[a["name"]] = url
        except Exception:
            pass

    return image_map


# ─────────────────────────────
#  Health check
# ─────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Hybrid Anime Recommendation API"}), 200


# ─────────────────────────────
#  Anime name autocomplete search
# ─────────────────────────────
@app.route("/api/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify([]), 200
    try:
        anime_df = pd.read_csv(DF)
        mask = anime_df["eng_version"].str.lower().str.contains(q.lower(), na=False)
        matches = anime_df[mask]["eng_version"].dropna().unique().tolist()
        matches.sort(key=lambda x: (not x.lower().startswith(q.lower()), x))
        return jsonify(matches[:15]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────
#  Recommendations endpoint  (accepts anime_name now)
# ─────────────────────────────
@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json(force=True)

    anime_name    = data.get("anime_name", "").strip()
    user_weight   = float(data.get("user_weight", 0.5))
    content_weight = float(data.get("content_weight", 0.5))

    if not anime_name:
        return jsonify({"error": "anime_name is required"}), 400

    try:
        anime_names = recommendation_by_anime_name(anime_name, user_weight=user_weight, content_weight=content_weight)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Recommendation failed: {str(e)}"}), 500

    if not anime_names:
        return jsonify({"error": f"No recommendations found for '{anime_name}'. Try a more popular title."}), 404

    # Enrich with metadata
    anime_df = pd.read_csv(DF)
    results = []
    for name in anime_names:
        try:
            row = anime_df[anime_df["eng_version"] == name]
            if row.empty:
                row = anime_df[anime_df["eng_version"].str.lower() == name.lower()]

            if not row.empty:
                anime_id = int(row["anime_id"].values[0])
                genres_raw = row["Genres"].values[0]
                genres = [g.strip() for g in str(genres_raw).split(",")] if pd.notna(genres_raw) else []
                score = row["Score"].values[0]
                score = float(score) if pd.notna(score) else None

                try:
                    synopsis = getSynopsis(anime_id, SYNOPSIS_DF)
                except Exception:
                    synopsis = "No synopsis available."

                results.append({
                    "name": name,
                    "anime_id": anime_id,
                    "genres": genres,
                    "score": score,
                    "episodes": str(row["Episodes"].values[0]) if pd.notna(row["Episodes"].values[0]) else "N/A",
                    "premiered": str(row["Premiered"].values[0]) if pd.notna(row["Premiered"].values[0]) else "N/A",
                    "type": str(row["Type"].values[0]) if pd.notna(row["Type"].values[0]) else "N/A",
                    "members": int(row["Members"].values[0]) if pd.notna(row["Members"].values[0]) else 0,
                    "synopsis": synopsis,
                    "image_url": None,
                })
            else:
                results.append({"name": name, "anime_id": None, "genres": [], "score": None,
                                 "synopsis": "N/A", "image_url": None})
        except Exception:
            results.append({"name": name, "anime_id": None, "genres": [], "score": None,
                             "synopsis": "N/A", "image_url": None})

    # Fetch all images in one batched AniList request
    image_map = fetch_images_batch(results)
    for r in results:
        r["image_url"] = image_map.get(r["name"])

    return jsonify({"anime_name": anime_name, "recommendations": results}), 200


# ─────────────────────────────
#  Single anime detail
# ─────────────────────────────
@app.route("/api/anime/<path:name>", methods=["GET"])
def anime_detail(name):
    try:
        anime_df = pd.read_csv(DF)
        row = anime_df[anime_df["eng_version"] == name]
        if row.empty:
            return jsonify({"error": f"Anime '{name}' not found"}), 404

        anime_id = int(row["anime_id"].values[0])
        genres_raw = row["Genres"].values[0]
        genres = [g.strip() for g in str(genres_raw).split(",")] if pd.notna(genres_raw) else []

        try:
            synopsis = getSynopsis(anime_id, SYNOPSIS_DF)
        except Exception:
            synopsis = "No synopsis available."

        return jsonify({
            "name": name,
            "anime_id": anime_id,
            "genres": genres,
            "score": float(row["Score"].values[0]) if pd.notna(row["Score"].values[0]) else None,
            "episodes": str(row["Episodes"].values[0]),
            "premiered": str(row["Premiered"].values[0]),
            "type": str(row["Type"].values[0]),
            "members": int(row["Members"].values[0]),
            "synopsis": synopsis,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
