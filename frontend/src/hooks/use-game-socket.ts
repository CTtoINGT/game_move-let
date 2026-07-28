import { useCallback, useEffect, useRef, useState } from 'react'
import { emptySnapshot, type GameSnapshot } from '@/game/types'

function gameSocketUrl() {
  if (import.meta.env.VITE_GAME_WS_URL) {
    return import.meta.env.VITE_GAME_WS_URL
  }
  if (import.meta.env.DEV) {
    return 'ws://localhost:8080/ws/game'
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/game`
}

export function useGameSocket() {
  const socketRef = useRef<WebSocket | null>(null)
  const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = new WebSocket(gameSocketUrl())
    socketRef.current = socket
    socket.addEventListener('open', () => setConnected(true))
    socket.addEventListener('close', () => setConnected(false))
    socket.addEventListener('message', (message) => {
      setSnapshot(JSON.parse(message.data) as GameSnapshot)
    })
    return () => socket.close()
  }, [])

  const send = useCallback((payload: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const start = useCallback(() => send({ type: 'start' }), [send])
  const restart = useCallback(() => send({ type: 'restart' }), [send])
  const sendInput = useCallback((keys: string[]) => send({ type: 'input', keys }), [send])

  return {
    connected,
    snapshot,
    start,
    restart,
    sendInput,
  }
}
