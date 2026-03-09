// Genre → colour mapping for badge pills
export const GENRE_COLORS = {
  'Action':       { bg: 'rgba(239,68,68,0.18)',   border: 'rgba(239,68,68,0.5)',   text: '#fca5a5' },
  'Adventure':    { bg: 'rgba(249,115,22,0.18)',  border: 'rgba(249,115,22,0.5)',  text: '#fdba74' },
  'Comedy':       { bg: 'rgba(234,179,8,0.18)',   border: 'rgba(234,179,8,0.5)',   text: '#fde047' },
  'Drama':        { bg: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.5)',  text: '#d8b4fe' },
  'Fantasy':      { bg: 'rgba(124,58,237,0.22)',  border: 'rgba(124,58,237,0.6)',  text: '#c4b5fd' },
  'Horror':       { bg: 'rgba(220,38,38,0.18)',   border: 'rgba(220,38,38,0.5)',   text: '#f87171' },
  'Magic':        { bg: 'rgba(236,72,153,0.18)',  border: 'rgba(236,72,153,0.5)',  text: '#f9a8d4' },
  'Mecha':        { bg: 'rgba(20,184,166,0.18)',  border: 'rgba(20,184,166,0.5)',  text: '#5eead4' },
  'Music':        { bg: 'rgba(14,165,233,0.18)',  border: 'rgba(14,165,233,0.5)',  text: '#7dd3fc' },
  'Mystery':      { bg: 'rgba(99,102,241,0.18)',  border: 'rgba(99,102,241,0.5)',  text: '#a5b4fc' },
  'Psychological':{ bg: 'rgba(139,92,246,0.18)',  border: 'rgba(139,92,246,0.5)',  text: '#c4b5fd' },
  'Romance':      { bg: 'rgba(244,63,94,0.18)',   border: 'rgba(244,63,94,0.5)',   text: '#fda4af' },
  'Sci-Fi':       { bg: 'rgba(0,229,255,0.12)',   border: 'rgba(0,229,255,0.4)',   text: '#67e8f9' },
  'Slice of Life':{ bg: 'rgba(52,211,153,0.18)',  border: 'rgba(52,211,153,0.5)',  text: '#6ee7b7' },
  'Sports':       { bg: 'rgba(16,185,129,0.18)',  border: 'rgba(16,185,129,0.5)',  text: '#34d399' },
  'Supernatural': { bg: 'rgba(167,139,250,0.18)', border: 'rgba(167,139,250,0.5)', text: '#c4b5fd' },
  'Thriller':     { bg: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.4)',   text: '#fca5a5' },
  'default':      { bg: 'rgba(100,116,139,0.18)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8' },
};

export function getGenreStyle(genre) {
  return GENRE_COLORS[genre] || GENRE_COLORS['default'];
}

export function formatMembers(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function scoreColor(score) {
  if (!score) return 'var(--clr-text-muted)';
  if (score >= 8.5) return '#22d3ee';
  if (score >= 7.5) return '#a3e635';
  if (score >= 6.0) return '#fbbf24';
  return '#f87171';
}
