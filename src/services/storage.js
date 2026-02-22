const KEYS = {
  PLAYLISTS: 'autodj_playlists',
  SETTINGS: 'autodj_settings',
  ROTATION: 'autodj_rotation',
  STATS: 'autodj_stats',
}

const DEFAULT_SETTINGS = {
  rotation_mode: 'playlist_end',
  interval_minutes: 30,
  fallback_playlist_id: '37i9dQZEVXbKY7jLzlJ11V',
  enabled: false,
}

const DEFAULT_PLAYLISTS = [
  { id: '1', playlist_id: '37i9dQZEVXbKY7jLzlJ11V', name: 'Top 50 Nigeria', source: 'default' },
  { id: '2', playlist_id: '05RVGTjUUPNOc644TSqqwL', name: 'B-CD Playlist', source: 'default' },
  { id: '3', playlist_id: '5vpppBmyooe3Wt8jfozyiv', name: "AutoDJ Today's Hit", source: 'default' },
]

// --- Auto-migrate stale data ---
const STORAGE_VERSION = '2'  // bump this when defaults change
;(function migrate() {
  const v = localStorage.getItem('autodj_version')
  if (v !== STORAGE_VERSION) {
    localStorage.removeItem(KEYS.PLAYLISTS)
    localStorage.removeItem(KEYS.ROTATION)
    localStorage.setItem('autodj_version', STORAGE_VERSION)
  }
})()

// --- Playlists ---
export function getPlaylists() {
  try {
    const raw = localStorage.getItem(KEYS.PLAYLISTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePlaylists(playlists) {
  localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists))
}

export function addPlaylist(playlist) {
  const playlists = getPlaylists()
  playlists.push(playlist)
  savePlaylists(playlists)
  return playlists
}

export function removePlaylist(id) {
  const playlists = getPlaylists().filter(p => p.id !== id)
  savePlaylists(playlists)
  return playlists
}

export function loadDefaultPlaylists() {
  const existing = getPlaylists()
  const existingIds = new Set(existing.map(p => p.playlist_id))
  let added = 0
  for (const dp of DEFAULT_PLAYLISTS) {
    if (!existingIds.has(dp.playlist_id)) {
      existing.push({ ...dp, id: crypto.randomUUID() })
      added++
    }
  }
  savePlaylists(existing)
  return { playlists: existing, added }
}

// --- Settings ---
export function getSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

// --- Rotation state ---
export function getRotationState() {
  try {
    const raw = localStorage.getItem(KEYS.ROTATION)
    return raw ? JSON.parse(raw) : { enabled: false, current_playlist_index: 0 }
  } catch {
    return { enabled: false, current_playlist_index: 0 }
  }
}

export function saveRotationState(state) {
  localStorage.setItem(KEYS.ROTATION, JSON.stringify(state))
}

// --- Parse playlist ID from URL ---
export function parsePlaylistId(input) {
  if (!input || !input.trim()) return null
  const trimmed = input.trim()
  // spotify:playlist:XXXXX
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/)
  if (uriMatch) return uriMatch[1]
  // https://open.spotify.com/playlist/XXXXX?si=...
  const urlMatch = trimmed.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/)
  if (urlMatch) return urlMatch[1]
  // Raw ID (22 chars alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed
  return null
}

// --- Fetch playlist name from Spotify oEmbed (no auth needed) ---
export async function fetchPlaylistName(playlistId) {
  try {
    const url = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    // oEmbed title format is usually "PlaylistName - playlist by UserName | Spotify"
    // or just "PlaylistName" — extract the first part
    const title = data.title || null
    if (title) {
      // Remove trailing " | Spotify" and " - playlist by ..." if present
      return title.replace(/\s*\|\s*Spotify$/, '').replace(/\s*-\s*playlist by\s+.*$/, '').trim()
    }
    return null
  } catch {
    return null
  }
}

// --- Build rotation status object (mirrors old backend /rotation/status shape) ---
export function buildRotationStatus() {
  const settings = getSettings()
  const playlists = getPlaylists()
  const rotation = getRotationState()
  const enabled = rotation.enabled && playlists.length >= 2
  const idx = rotation.current_playlist_index || 0
  const safeIdx = playlists.length > 0 ? idx % playlists.length : 0
  const nextIdx = playlists.length > 0 ? (safeIdx + 1) % playlists.length : 0

  return {
    enabled,
    rotation_mode: settings.rotation_mode,
    interval_minutes: settings.interval_minutes,
    current_playlist_index: safeIdx,
    current_playlist: playlists.length > 0 ? playlists[safeIdx] : null,
    next_playlist: playlists.length > 1 ? playlists[nextIdx] : null,
    playlists,
    total_playlists: playlists.length,
  }
}

// --- Play Stats ---
// Shape: { playlists: { [playlistId]: { name, count, lastPlayed } }, songs: { [trackUri]: { name, artist, count, lastPlayed, playlistId } } }
export function getStats() {
  try {
    const raw = localStorage.getItem(KEYS.STATS)
    return raw ? JSON.parse(raw) : { playlists: {}, songs: {} }
  } catch {
    return { playlists: {}, songs: {} }
  }
}

function saveStats(stats) {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats))
}

export function recordPlaylistPlay(playlistId, playlistName) {
  const stats = getStats()
  if (!stats.playlists[playlistId]) {
    stats.playlists[playlistId] = { name: playlistName, count: 0, lastPlayed: null }
  }
  stats.playlists[playlistId].count += 1
  stats.playlists[playlistId].lastPlayed = new Date().toISOString()
  stats.playlists[playlistId].name = playlistName || stats.playlists[playlistId].name
  saveStats(stats)
}

export function recordSongPlay(trackUri, trackName, artistName, playlistId) {
  const stats = getStats()
  if (!stats.songs[trackUri]) {
    stats.songs[trackUri] = { name: trackName, artist: artistName, count: 0, lastPlayed: null, playlistId }
  }
  stats.songs[trackUri].count += 1
  stats.songs[trackUri].lastPlayed = new Date().toISOString()
  stats.songs[trackUri].name = trackName || stats.songs[trackUri].name
  stats.songs[trackUri].artist = artistName || stats.songs[trackUri].artist
  saveStats(stats)
}

export function getTopSongs(limit = 20) {
  const stats = getStats()
  return Object.entries(stats.songs)
    .map(([uri, data]) => ({ uri, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getTopPlaylists(limit = 20) {
  const stats = getStats()
  return Object.entries(stats.playlists)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function clearStats() {
  localStorage.removeItem(KEYS.STATS)
}

// --- Skip to next playlist ---
export function skipToNext() {
  const playlists = getPlaylists()
  if (playlists.length < 2) return null
  const rotation = getRotationState()
  const currentIdx = rotation.current_playlist_index || 0
  const nextIdx = (currentIdx + 1) % playlists.length
  const newState = { ...rotation, current_playlist_index: nextIdx }
  saveRotationState(newState)
  return {
    current_playlist: playlists[nextIdx],
    next_playlist: playlists[(nextIdx + 1) % playlists.length],
    current_playlist_index: nextIdx,
  }
}
