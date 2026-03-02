import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import {
  getSettings, getPlaylists, getRotationState, saveRotationState,
  buildRotationStatus, skipToNext, recordPlaylistPlay,
} from '../services/storage'

function openInSpotify(playlistId) {
  const webUrl = `https://open.spotify.com/playlist/${playlistId}`
  window.open(webUrl, '_blank')
}

export default function Rotation() {
  const [status, setStatus] = useState(() => buildRotationStatus())
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [switching, setSwitching] = useState(false)
  const [switchCountdown, setSwitchCountdown] = useState(null)
  const switchCountdownRef = useRef(null)
  const targetTimeRef = useRef(null)
  const timerRef = useRef(null)
  const skippingRef = useRef(false)
  const enabledRef = useRef(false)
  const doSkipRef = useRef(null)

  // Refresh status from localStorage
  const refreshStatus = useCallback(() => {
    const data = buildRotationStatus()
    setStatus(data)
    enabledRef.current = data.enabled
    return data
  }, [])

  const doSkip = useCallback(() => {
    if (skippingRef.current) return
    skippingRef.current = true
    if (switchCountdownRef.current) {
      clearInterval(switchCountdownRef.current)
      switchCountdownRef.current = null
    }
    const result = skipToNext()
    if (result?.current_playlist?.playlist_id) {
      recordPlaylistPlay(result.current_playlist.playlist_id, result.current_playlist.name)
      openInSpotify(result.current_playlist.playlist_id)
    }
    const data = refreshStatus()
    const settings = getSettings()
    if (settings.rotation_mode === 'interval') {
      const secs = (settings.interval_minutes || 1) * 60
      targetTimeRef.current = Date.now() + secs * 1000
      setCountdown(secs)
    } else {
      setCountdown(null)
      targetTimeRef.current = null
    }
    skippingRef.current = false
  }, [refreshStatus])

  // Keep doSkipRef in sync
  useEffect(() => { doSkipRef.current = doSkip }, [doSkip])

  // Single timer: ticks every second, updates countdown, triggers skip at 0
  useEffect(() => {
    refreshStatus()
    timerRef.current = setInterval(() => {
      if (!targetTimeRef.current || !enabledRef.current) return
      const remaining = Math.max(0, Math.round((targetTimeRef.current - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining <= 0 && !switchCountdownRef.current) {
        targetTimeRef.current = null
        // Timer hit 0 — start 3-2-1 switch countdown, then skip
        setSwitching(true)
        setSwitchCountdown(3)
        let count = 3
        switchCountdownRef.current = setInterval(() => {
          count -= 1
          if (count > 0) {
            setSwitchCountdown(count)
          } else {
            clearInterval(switchCountdownRef.current)
            switchCountdownRef.current = null
            setSwitching(false)
            setSwitchCountdown(null)
            doSkipRef.current?.()
          }
        }, 1000)
      }
    }, 1000)
    return () => {
      clearInterval(timerRef.current)
      if (switchCountdownRef.current) {
        clearInterval(switchCountdownRef.current)
        switchCountdownRef.current = null
      }
    }
  }, [refreshStatus])

  const formatTime = (secs) => {
    if (secs == null) return '--:--'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setError('')
    setSuccessMsg('')
    const playlists = getPlaylists()
    if (playlists.length < 2) {
      setError('You need at least 2 playlists to start rotation.')
      return
    }
    const rotation = getRotationState()
    const settings = getSettings()
    saveRotationState({ ...rotation, enabled: true })
    const data = refreshStatus()
    if (data.current_playlist) {
      recordPlaylistPlay(data.current_playlist.playlist_id, data.current_playlist.name)
      openInSpotify(data.current_playlist.playlist_id)
    }
    if (settings.rotation_mode === 'interval') {
      const secs = (settings.interval_minutes || 1) * 60
      targetTimeRef.current = Date.now() + secs * 1000
      setCountdown(secs)
    }
    setSuccessMsg('Rotation started! Spotify should open — hit play there.')
  }

  const handleStop = () => {
    setError('')
    setSuccessMsg('')
    setSwitching(false)
    setSwitchCountdown(null)
    if (switchCountdownRef.current) { clearInterval(switchCountdownRef.current); switchCountdownRef.current = null }
    const rotation = getRotationState()
    saveRotationState({ ...rotation, enabled: false })
    setCountdown(null)
    targetTimeRef.current = null
    enabledRef.current = false
    refreshStatus()
  }

  const handleSkip = () => {
    setError('')
    setSuccessMsg('')
    setSwitching(false)
    setSwitchCountdown(null)
    if (switchCountdownRef.current) { clearInterval(switchCountdownRef.current); switchCountdownRef.current = null }
    const result = skipToNext()
    if (!result) {
      setError('No playlists to skip to.')
      return
    }
    if (result.current_playlist?.playlist_id) {
      recordPlaylistPlay(result.current_playlist.playlist_id, result.current_playlist.name)
      openInSpotify(result.current_playlist.playlist_id)
    }
    setSuccessMsg('Skipped! Opening next playlist in Spotify...')
    const data = refreshStatus()
    const settings = getSettings()
    if (settings.rotation_mode === 'interval') {
      const secs = (settings.interval_minutes || 1) * 60
      targetTimeRef.current = Date.now() + secs * 1000
      setCountdown(secs)
    } else {
      setCountdown(null)
      targetTimeRef.current = null
    }
  }

  const handleOpenCurrent = () => {
    if (currentPl?.playlist_id) {
      openInSpotify(currentPl.playlist_id)
    }
  }

  const currentPl = status?.current_playlist
  const nextPl = status?.next_playlist

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Rotation</h1>
          <p className="text-gray-400">AutoDJ opens playlists in your Spotify app — full songs, real streams.</p>
        </div>

        {successMsg && <p className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-4 py-3 mb-4">{successMsg}</p>}
        {error && <p className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 mb-4">{error}</p>}

        {/* Now Playing Card */}
        {status?.enabled && currentPl && (
          <div className="bg-gradient-to-br from-green-900/40 to-gray-800 rounded-xl p-6 border border-green-700/50 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                  <span className="text-green-400 text-sm font-medium uppercase tracking-wide">Now Playing</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold truncate mb-1">{currentPl.name}</h2>
                <p className="text-gray-400 text-sm">Playing in your Spotify app</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={handleOpenCurrent}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Open in Spotify
              </button>
              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                Skip to Next
              </button>
            </div>
          </div>
        )}

        {/* Countdown Timer — interval mode */}
        {status?.enabled && status?.rotation_mode === 'interval' && countdown != null && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Next playlist switch in</p>
            <p className="text-4xl sm:text-5xl font-mono font-bold text-green-400">{formatTime(countdown)}</p>
            <p className="text-gray-500 text-sm mt-2">Every {status.interval_minutes} minutes — Spotify will open automatically</p>
          </div>
        )}

        {/* Playlist End mode — manual skip notice */}
        {status?.enabled && status?.rotation_mode === 'playlist_end' && (
          <div className="bg-gray-800 rounded-lg p-5 border border-blue-500/30 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse mt-1.5 flex-shrink-0"></span>
              <div>
                <p className="text-blue-400 font-medium mb-1">Manual Switch Mode</p>
                <p className="text-gray-400 text-sm">
                  When your current playlist ends in Spotify, tap <strong className="text-white">Skip to Next</strong> above to open the next playlist.
                  For fully automatic switching, go to Settings and switch to <strong className="text-white">Interval mode</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Switching overlay */}
        {switching && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-6 text-center">
            <p className="text-red-400 font-mono font-bold text-3xl mb-2">Switching in {switchCountdown ?? 0}...</p>
            <p className="text-gray-400 text-sm">The next playlist will open in Spotify automatically</p>
          </div>
        )}

        {/* Next Up */}
        {status?.enabled && nextPl && !switching && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Up Next</p>
                <h3 className="text-lg font-semibold">{nextPl.name}</h3>
              </div>
              <span className="text-gray-500 text-sm">
                {status?.rotation_mode === 'interval' ? 'Auto-switches when timer ends' : 'Use Skip to switch'}
              </span>
            </div>
          </div>
        )}

        {/* Rotation Queue */}
        {status?.enabled && status?.playlists?.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-lg font-semibold mb-4">Rotation Queue ({status.total_playlists} playlists)</h2>
            <div className="space-y-2">
              {status.playlists.map((pl, i) => (
                <div
                  key={pl.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    i === status.current_playlist_index
                      ? 'bg-green-900/30 border border-green-700/50'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6 text-right">{i + 1}</span>
                    <span className={i === status.current_playlist_index ? 'text-green-400 font-semibold' : 'text-gray-300'}>
                      {pl.name}
                    </span>
                    {i === status.current_playlist_index && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Now</span>
                    )}
                  </div>
                  <a
                    href={`https://open.spotify.com/playlist/${pl.playlist_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-xs"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleStart}
              disabled={status && status.enabled}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
            >
              Start Rotation
            </button>
            <button
              onClick={handleStop}
              disabled={status && !status.enabled}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
            >
              Stop Rotation
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-3 text-center">
            {status?.enabled
              ? 'AutoDJ opens playlists in your Spotify app. Just keep Spotify running!'
              : 'Press Start to begin. Your first playlist will open in Spotify automatically.'}
          </p>
        </div>

        {/* Not started state */}
        {!status?.enabled && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <h3 className="text-lg font-semibold mb-2">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="p-3">
                <p className="text-2xl mb-2">1</p>
                <p>Hit <span className="text-green-400">Start Rotation</span></p>
              </div>
              <div className="p-3">
                <p className="text-2xl mb-2">2</p>
                <p>Spotify opens — <span className="text-green-400">press play</span> in the Spotify app</p>
              </div>
              <div className="p-3">
                <p className="text-2xl mb-2">3</p>
                <p>AutoDJ <span className="text-green-400">auto-opens the next playlist</span> when the timer ends</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <p className="text-green-400 text-sm">Full songs — Real Spotify streams — Counts on charts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
