import os
import requests
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from config.path_config import *
from utils.helper import getAnimeFeame, getSynopsis
from pipelines.prediction_pipeline import hybrid_recommendation

app = Flask(__name__)
CORS(app)  # Allow all origins for GCP + local Vite dev


# ─────────────────────────────
#  AniList batched image fetcher
#  Makes ONE GraphQL request for up to 10 anime at once using aliases.
#  Falls back to Jikan per-anime if AniList returns nothing for that title.
# ─────────────────────────────
def fetch_images_batch(anime_results):
    """Fetch all poster images in a single AniList GraphQL query.
    Returns dict: { name -> image_url }
    """
    # Build query aliases: a0, a1 … a9
    entries = [(i, a) for i, a in enumerate(anime_results) if a.get("anime_id")]

    if not entries:
        return {}

    var_decls = ", ".join(f"$id{i}: Int" for i, _ in entries)
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
        pass  # Proceed to per-anime Jikan fallback below

    # Jikan fallback for any anime that AniList missed
    missing = [a for i, a in entries if a["name"] not in image_map]
    for a in missing:
        try:
            jr = requests.get(
                f"https://api.jikan.moe/v4/anime/{a['anime_id']}",
                timeout=6,
            )
            if jr.ok:
                jd = jr.json()
                img = jd.get("data", {}).get("images", {}).get("jpg", {})
                url = img.get("large_image_url") or img.get("image_url")
                if url:
                    image_map[a["name"]] = url
        except Exception:
            pass

    return image_map


# ─────────────────────────────
#  Health check (GCP / Cloud Run)
# ─────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Hybrid Anime Recommendation API"}), 200


# ─────────────────────────────
#  Recommendations endpoint
# ─────────────────────────────
@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json(force=True)

    user_id = data.get("user_id")
    user_weight = float(data.get("user_weight", 0.5))
    content_weight = float(data.get("content_weight", 0.5))

    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "user_id must be an integer"}), 400

    try:
        anime_names = hybrid_recommendation(user_id, user_weight=user_weight, content_weight=content_weight)
    except Exception as e:
        return jsonify({"error": f"Recommendation failed: {str(e)}"}), 500

    # Enrich each recommendation with metadata from local CSVs
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
                episodes = row["Episodes"].values[0]
                episodes = str(episodes) if pd.notna(episodes) else "N/A"
                premiered = row["Premiered"].values[0]
                premiered = str(premiered) if pd.notna(premiered) else "N/A"
                anime_type = row["Type"].values[0]
                anime_type = str(anime_type) if pd.notna(anime_type) else "N/A"
                members = row["Members"].values[0]
                members = int(members) if pd.notna(members) else 0

                try:
                    synopsis = getSynopsis(anime_id, SYNOPSIS_DF)
                except Exception:
                    synopsis = "No synopsis available."

                results.append({
                    "name": name,
                    "anime_id": anime_id,
                    "genres": genres,
                    "score": score,
                    "episodes": episodes,
                    "premiered": premiered,
                    "type": anime_type,
                    "members": members,
                    "synopsis": synopsis,
                    "image_url": None,  # filled below
                })
            else:
                results.append({"name": name, "anime_id": None, "genres": [], "score": None,
                                 "synopsis": "N/A", "image_url": None})

        except Exception:
            results.append({"name": name, "anime_id": None, "genres": [], "score": None,
                             "synopsis": "N/A", "image_url": None})

    # ── Fetch all images in one batched AniList request ──
    image_map = fetch_images_batch(results)
    for r in results:
        r["image_url"] = image_map.get(r["name"])

    return jsonify({"user_id": user_id, "recommendations": results}), 200


# ─────────────────────────────
#  Single anime detail endpoint
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
