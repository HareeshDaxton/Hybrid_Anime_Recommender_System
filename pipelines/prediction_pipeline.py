import joblib
import pandas as pd
from config.path_config import *
from utils.helper import *


def hybrid_recommendation(user_id, user_weight=0.5, content_weight=0.5):
    """Run hybrid (user CF + content-based) recommendation for a known user_id."""

    similar_users = find_similar_users(user_id, USER_WEIGHTS_PATH, USER2USER_ENCODED, USER2USER_DECODED)
    user_pref = get_user_preferences(user_id, RATING_DF, DF)

    # Guard: if no similar users found, return empty
    if similar_users is None or similar_users.empty:
        return []

    user_recommended_animes = get_user_recommendations(similar_users, user_pref, DF, SYNOPSIS_DF, RATING_DF)

    if user_recommended_animes is None or user_recommended_animes.empty:
        return []

    user_recommended_anime_list = user_recommended_animes["anime_name"].tolist()

    # Content-based expansion
    content_recommended_animes = []
    for anime in user_recommended_anime_list:
        try:
            similar_animes = find_similar_animes(anime, ANIME_WEIGHTS_PATH, ANIME2ANIME_ENCODED, ANIME2ANIME_DECODED, DF)
            if similar_animes is not None and not similar_animes.empty:
                content_recommended_animes.extend(similar_animes["name"].tolist())
        except Exception:
            pass

    combined_scores = {}
    for anime in user_recommended_anime_list:
        combined_scores[anime] = combined_scores.get(anime, 0) + user_weight

    for anime in content_recommended_animes:
        combined_scores[anime] = combined_scores.get(anime, 0) + content_weight

    sorted_animes = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
    return [anime for anime, score in sorted_animes[:10]]


def recommendation_by_anime_name(anime_name, user_weight=0.5, content_weight=0.5):
    """Recommend anime based on a watched anime title (no user_id needed).

    Strategy:
    1. Find the anime_id for the given name in the dataset.
    2. Look up users who rated that anime highly in the processed rating_df.
    3. Find the first proxy user who exists in the user embedding (training data).
    4. Run hybrid_recommendation for that proxy user, excluding the input anime.
    5. If no valid proxy found, fall back to pure content-based (find_similar_animes).
    """
    anime_df = pd.read_csv(DF)

    # ── Step 1: Resolve anime name to anime_id ──
    row = anime_df[anime_df["eng_version"].str.lower() == anime_name.strip().lower()]
    if row.empty:
        # Partial match fallback
        row = anime_df[anime_df["eng_version"].str.lower().str.contains(anime_name.strip().lower(), na=False)]
    if row.empty:
        raise ValueError(f"Anime '{anime_name}' not found in the dataset.")

    canonical_name = row["eng_version"].values[0]
    anime_id = int(row["anime_id"].values[0])

    # ── Step 2: Find high-rating users for this anime ──
    rating_df = pd.read_csv(RATING_DF)
    anime_ratings = rating_df[rating_df["anime_id"] == anime_id]

    user2user_encoded = joblib.load(USER2USER_ENCODED)

    proxy_user_id = None

    if not anime_ratings.empty:
        # Prefer users who rated it >= median rating for this anime
        median_rating = anime_ratings["rating"].median()
        high_raters = anime_ratings[anime_ratings["rating"] >= median_rating]

        # Pick the first user that exists in the user embedding space
        for uid in high_raters.sort_values("rating", ascending=False)["user_id"].values:
            if int(uid) in user2user_encoded:
                proxy_user_id = int(uid)
                break

    # ── Step 3: Run hybrid recommendation via proxy user ──
    if proxy_user_id is not None:
        results = hybrid_recommendation(proxy_user_id, user_weight, content_weight)
        # Remove the input anime from results
        results = [r for r in results if r.lower() != canonical_name.lower()]
        if results:
            return results[:10]

    # ── Step 4: Pure content-based fallback ──
    try:
        similar = find_similar_animes(
            canonical_name, ANIME_WEIGHTS_PATH, ANIME2ANIME_ENCODED, ANIME2ANIME_DECODED, DF, n=10
        )
        if similar is not None and not similar.empty:
            return similar["name"].tolist()[:10]
    except Exception as e:
        raise ValueError(f"Could not generate recommendations for '{anime_name}': {e}")

    return []
