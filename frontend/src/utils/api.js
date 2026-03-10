const BASE = '/api';

export async function fetchRecommendations(animeName, userWeight = 0.5, contentWeight = 0.5) {
  const res = await fetch(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anime_name: animeName,
      user_weight: userWeight,
      content_weight: contentWeight,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  return res.json(); // { anime_name, recommendations: [...] }
}

export async function searchAnime(query) {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json(); // string[]
}

export async function fetchAnimeDetail(name) {
  const encoded = encodeURIComponent(name);
  const res = await fetch(`${BASE}/anime/${encoded}`);
  if (!res.ok) throw new Error(`Anime not found: ${name}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.ok;
}
