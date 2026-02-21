import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import {
  getSettings, getPlaylists, getRotationState, saveRotationState,
  buildRotationStatus, skipToNext,
} from '../services/storage'

export default function Rotation() {
  const [status, setStatus] = useState(() => buildRotationStatus())
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [switchCountdown, setSwitchCountdown] = useState(null)
  const switchCountdownRef = useRef(null)
  const targetTimeRef = useRef(null)
  const timerRef = useRef(null)
  const skippingRef = useRef(false)
  const enabledRef = useRef(false)
  const controllerRef = useRef(null)
  const embedElRef = useRef(null)
  const currentPlIdRef = useRef(null)
  const apiReadyRef = useRef(false)
  const pendingUriRef = useRef(null)
  // Playlist-end detection refs
  const wasPlayingRef = useRef(false)
  const endCheckTimerRef = useRef(null)
  const doSkipRef = useRef(null)
  const modeRef = useRef('playlist_end')

  // Load the Spotify IFrame API script once
  useEffect(() => {
    if (document.getElementById('spotify-iframe-api')) return
    const script = document.createElement('script')
    script.id = 'spotify-iframe-api'
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Set up the global callback for when the API is ready
  useEffect(() => {
    // If the API already loaded from a previous mount, grab it
    if (window.SpotifyIframeApi && !apiReadyRef.current) {
      apiReadyRef.current = window.SpotifyIframeApi
    }
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      apiReadyRef.current = IFrameAPI
      window.SpotifyIframeApi = IFrameAPI
      // If we already have a pending URI, create the controller now
      if (pendingUriRef.current && embedElRef.current) {
        createPlayer(IFrameAPI, pendingUriRef.current)
        pendingUriRef.current = null
      }
    }
    return () => { window.onSpotifyIframeApiReady = undefined }
  }, [])

  const createPlayer = useCallback((IFrameAPI, playlistId) => {
    const element = embedElRef.current
    if (!element) return
    const options = {
      uri: `spotify:playlist:${playlistId}`,
      width: '100%',
      height: 352,
    }
    IFrameAPI.createController(element, options, (EmbedController) => {
      controllerRef.current = EmbedController
      currentPlIdRef.current = playlistId
      setPlayerReady(true)
      EmbedController.addListener('ready', () => {})
      // Playlist-end detection via playback events (active in ALL modes)
      // In interval mode: skips early if playlist ends before timer
      // In playlist_end mode: this is the primary skip trigger
      let lastPosition = 0
      EmbedController.addListener('playback_update', (e) => {
        const data = e?.data || e
        const isPaused = data.isPaused
        const position = data.position ?? 0
        const duration = data.duration ?? 0

        if (!isPaused) {
          // Currently playing — track position, mark active, cancel any pending end-check
          lastPosition = position
          wasPlayingRef.current = true
          // Cancel playlist-end detection if music resumed (false positive)
          if (endCheckTimerRef.current) {
            clearInterval(endCheckTimerRef.current)
            endCheckTimerRef.current = null
            // Only clear switching UI if it was started by playlist-end detection, not by timer
            if (!switchCountdownRef.current) {
              setSwitching(false)
              setSwitchCountdown(null)
            }
          }
        } else if (wasPlayingRef.current && isPaused) {
          // Paused after playing — determine WHY
          const isNearEnd = duration > 0 && (duration - position) < 3000
          // pos jumped to 0 from a high position = playlist finished and reset
          const isEndReset = position === 0 && lastPosition > 5000
          // pos equals duration = track completed naturally
          const isTrackDone = duration > 0 && position >= duration - 500

          if (isNearEnd || isEndReset || isTrackDone) {
            // Natural end — show 3-2-1 countdown, skip at 0
            if (!endCheckTimerRef.current) {
              setSwitching(true)
              setSwitchCountdown(3)
              let count = 3
              endCheckTimerRef.current = setInterval(() => {
                count -= 1
                if (count > 0) {
                  setSwitchCountdown(count)
                } else {
                  clearInterval(endCheckTimerRef.current)
                  endCheckTimerRef.current = null
                  setSwitching(false)
                  setSwitchCountdown(null)
                  if (enabledRef.current) {
                    doSkipRef.current?.()
                  }
                }
              }, 1000)
            }
          }
          // Manual pause (mid-track) — do nothing, interval timer handles rotation
        }
      })
    })
  }, [])

  const switchPlaylist = useCallback((playlistId) => {
    if (!playlistId) return
    if (controllerRef.current) {
      currentPlIdRef.current = playlistId
      controllerRef.current.loadUri(`spotify:playlist:${playlistId}`)
      setTimeout(() => {
        controllerRef.current?.play()
      }, 1000)
    } else if (apiReadyRef.current && embedElRef.current) {
      createPlayer(apiReadyRef.current, playlistId)
    } else {
      pendingUriRef.current = playlistId
    }
  }, [createPlayer])

  // Refresh status from localStorage
  const refreshStatus = useCallback(() => {
    const data = buildRotationStatus()
    setStatus(data)
    enabledRef.current = data.enabled
    modeRef.current = data.rotation_mode || 'playlist_end'
    return data
  }, [])

  const doSkip = useCallback(() => {
    if (skippingRef.current) return
    skippingRef.current = true
    // Reset playlist-end detection state
    wasPlayingRef.current = false
    if (endCheckTimerRef.current) {
      clearInterval(endCheckTimerRef.current)
      endCheckTimerRef.current = null
    }
    if (switchCountdownRef.current) {
      clearInterval(switchCountdownRef.current)
      switchCountdownRef.current = null
    }
    const result = skipToNext()
    if (result?.current_playlist?.playlist_id) {
      currentPlIdRef.current = null
      switchPlaylist(result.current_playlist.playlist_id)
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
  }, [switchPlaylist, refreshStatus])

  // Keep doSkipRef in sync so the playback_update listener always calls the latest doSkip
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

  // Initialize the Spotify player when rotation is enabled and we have a playlist
  useEffect(() => {
    if (!status?.enabled || !status?.current_playlist?.playlist_id) return
    const pid = status.current_playlist.playlist_id

    // If controller exists and already showing this playlist, nothing to do
    if (controllerRef.current && currentPlIdRef.current === pid) return

    // If controller exists but for a different playlist, destroy and recreate
    if (controllerRef.current) {
      switchPlaylist(pid)
      return
    }

    // No controller yet — create one
    if (apiReadyRef.current && embedElRef.current) {
      createPlayer(apiReadyRef.current, pid)
    } else {
      pendingUriRef.current = pid
    }
  }, [status?.enabled, status?.current_playlist?.playlist_id, createPlayer, switchPlaylist])

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
    if (settings.rotation_mode === 'interval') {
      const secs = (settings.interval_minutes || 1) * 60
      targetTimeRef.current = Date.now() + secs * 1000
      setCountdown(secs)
    }
    setSuccessMsg('Rotation started!')
  }

  const handleStop = () => {
    setError('')
    setSuccessMsg('')
    // Reset all state
    wasPlayingRef.current = false
    setSwitching(false)
    setSwitchCountdown(null)
    if (switchCountdownRef.current) { clearInterval(switchCountdownRef.current); switchCountdownRef.current = null }
    if (endCheckTimerRef.current) { clearInterval(endCheckTimerRef.current); endCheckTimerRef.current = null }
    const rotation = getRotationState()
    saveRotationState({ ...rotation, enabled: false })
    setCountdown(null)
    targetTimeRef.current = null
    enabledRef.current = false
    if (controllerRef.current) {
      controllerRef.current.pause()
    }
    refreshStatus()
  }

  const handleSkip = () => {
    setError('')
    setSuccessMsg('')
    // Reset playlist-end detection state
    wasPlayingRef.current = false
    setSwitching(false)
    setSwitchCountdown(null)
    if (switchCountdownRef.current) { clearInterval(switchCountdownRef.current); switchCountdownRef.current = null }
    if (endCheckTimerRef.current) { clearInterval(endCheckTimerRef.current); endCheckTimerRef.current = null }
    const result = skipToNext()
    if (!result) {
      setError('No playlists to skip to.')
      return
    }
    setSuccessMsg('Skipped!')
    if (result.current_playlist?.playlist_id) {
      switchPlaylist(result.current_playlist.playlist_id)
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
  }

  const currentPl = status?.current_playlist
  const nextPl = status?.next_playlist

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Rotation</h1>
          <p className="text-gray-400">Press play once, AutoDJ handles the rest automatically.</p>
        </div>

        {successMsg && <p className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-4 py-3 mb-4">{successMsg}</p>}
        {error && <p className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 mb-4">{error}</p>}

        {/* Spotify Player (managed by IFrame API) */}
        <div style={{ display: status?.enabled && currentPl ? 'block' : 'none' }} className="mb-6">
          {status?.enabled && currentPl && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                <span className="text-green-400 font-semibold truncate">Now Playing: {currentPl.name}</span>
              </div>
              <button
                onClick={handleSkip}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex-shrink-0"
              >
                Skip to Next
              </button>
            </div>
          )}
          <div className="rounded-xl overflow-hidden bg-gray-800" style={{ minHeight: 232 }}>
            <div ref={embedElRef}></div>
          </div>
        </div>

        {/* Countdown Timer — interval mode only */}
        {status?.enabled && status?.rotation_mode === 'interval' && countdown != null && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Next playlist switch in</p>
            <p className="text-4xl sm:text-5xl font-mono font-bold text-green-400">{formatTime(countdown)}</p>
            <p className="text-gray-500 text-sm mt-2">Every {status.interval_minutes} minutes</p>
          </div>
        )}
        {/* Playlist End mode — auto-detect indicator */}
        {status?.enabled && status?.rotation_mode === 'playlist_end' && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <p className="text-gray-300 text-sm">
                <span className="text-blue-400 font-medium">Auto-detect mode</span> — AutoDJ will switch to the next playlist when this one finishes. Skip songs freely, it tracks your actual playback.
              </p>
            </div>
          </div>
        )}

        {/* Next Up */}
        {status?.enabled && nextPl && (
          <div className={`bg-gray-800 rounded-lg p-4 border mb-6 ${switching ? 'border-red-500/50' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Up Next</p>
                <h3 className="text-lg font-semibold">{nextPl.name}</h3>
              </div>
              {switching ? (
                <span className="text-red-400 font-mono font-bold text-sm">
                  Switching in {switchCountdown ?? 0}...
                </span>
              ) : (
                <span className="text-gray-500 text-sm">
                  {status?.rotation_mode === 'interval' ? 'Auto-switches when timer ends' : 'Auto-switches when playlist ends'}
                </span>
              )}
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
              ? 'Press play once on the player above. AutoDJ will switch playlists and keep playing automatically.'
              : 'Press Start to begin. A Spotify player will appear — just hit play once.'}
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
                <p>Press <span className="text-green-400">play once</span> on the Spotify player</p>
              </div>
              <div className="p-3">
                <p className="text-2xl mb-2">3</p>
                <p>AutoDJ <span className="text-green-400">auto-switches & plays</span> on schedule</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
