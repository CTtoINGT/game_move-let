import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameSnapshot } from '@/game/types'

export function useGameFeedback(snapshot: GameSnapshot) {
  const audioContext = useRef<AudioContext | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const previousEvent = useRef(0)

  const activateSound = useCallback(() => {
    const context = audioContext.current ?? new AudioContext()
    audioContext.current = context
    void context.resume()
    setSoundEnabled(true)
  }, [])

  useEffect(() => {
    if (snapshot.eventSequence === 0 || snapshot.eventSequence === previousEvent.current) return
    previousEvent.current = snapshot.eventSequence
    if (snapshot.event === 'CAPTURE' || snapshot.event === 'JACKPOT') {
      setBurstKey(snapshot.eventSequence)
      if (soundEnabled && audioContext.current) {
        playCaptureSound(audioContext.current, snapshot.event === 'JACKPOT')
      }
    }
  }, [snapshot.event, snapshot.eventSequence, soundEnabled])

  return { activateSound, burstKey, soundEnabled }
}

function playCaptureSound(context: AudioContext, jackpot: boolean) {
  const now = context.currentTime
  const notes = jackpot ? [440, 660, 880] : [440, 660]
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.07)
    gain.gain.setValueAtTime(0.0001, now + index * 0.07)
    gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.07 + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.16)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(now + index * 0.07)
    oscillator.stop(now + index * 0.07 + 0.17)
  })
}
