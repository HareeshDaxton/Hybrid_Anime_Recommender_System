/**
 * posterFetcher.js
 * 
 * Fetches anime poster images with a dual-source strategy:
 *  1. AniList GraphQL API (primary)  — 90 req/min, high-quality images, MAL ID supported via `idMal`
 *  2. Jikan REST API (fallback)       — only used if AniList returns nothing
 * 
 * A shared in-memory cache prevents duplicate network calls across
 * AnimeCard and AnimeModal renders.
 */

const cache = {}; // { [animeId]: string | null }

async function fetchFromAniList(malId) {
  const query = `
    query ($id: Int) {
      Media(idMal: $id, type: ANIME) {
        coverImage { extraLarge large medium }
      }
    }
  `;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { id: malId } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const img = json?.data?.Media?.coverImage;
    return img?.extraLarge || img?.large || img?.medium || null;
  } catch {
    return null;
  }
}

async function fetchFromJikan(malId) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.images?.jpg?.large_image_url ||
      json?.data?.images?.jpg?.image_url ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Fetch a poster URL for a given MAL anime ID.
 * Results are cached in memory for the session lifetime.
 * AniList is tried first; Jikan is the fallback.
 */
export async function fetchPosterUrl(animeId) {
  if (!animeId) return null;

  // Return cached result immediately (including null — meaning "no image found")
  if (Object.prototype.hasOwnProperty.call(cache, animeId)) {
    return cache[animeId];
  }

  // Mark as in-flight with a Promise so concurrent callers for the same ID
  // await the same request rather than firing duplicates.
  const promise = (async () => {
    let url = await fetchFromAniList(animeId);
    if (!url) {
      // Small pause before hitting Jikan to avoid immediate rate-limit
      await new Promise((r) => setTimeout(r, 200));
      url = await fetchFromJikan(animeId);
    }
    cache[animeId] = url;
    return url;
  })();

  // Temporarily store the promise so repeated calls await it
  cache[animeId] = promise;
  const result = await promise;
  cache[animeId] = result;
  return result;
}
