export type GameStatus = 'IDLE' | 'PLAYING' | 'FINISHED'

export type GameSnapshot = {
  status: GameStatus
  playerX: number
  playerY: number
  outletX: number
  outletY: number
  score: number
  combo: number
  remainingMillis: number
  comboRemainingMillis: number
  event: string
  eventSequence: number
}

export const emptySnapshot: GameSnapshot = {
  status: 'IDLE',
  playerX: 450,
  playerY: 280,
  outletX: 150,
  outletY: 150,
  score: 0,
  combo: 0,
  remainingMillis: 60_000,
  comboRemainingMillis: 0,
  event: 'READY',
  eventSequence: 0,
}
