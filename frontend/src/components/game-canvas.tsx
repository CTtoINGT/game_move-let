import { useEffect, useRef } from 'react'
import type { GameSnapshot } from '@/game/types'

const width = 900
const height = 560

type GameCanvasProps = {
  snapshot: GameSnapshot
}

export function GameCanvas({ snapshot }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, width, height)
    const backdrop = context.createLinearGradient(0, 0, width, height)
    backdrop.addColorStop(0, '#222044')
    backdrop.addColorStop(1, '#131225')
    context.fillStyle = backdrop
    context.fillRect(0, 0, width, height)

    context.strokeStyle = 'rgba(255, 244, 184, 0.11)'
    context.lineWidth = 2
    for (let x = 20; x < width; x += 56) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x - 36, height)
      context.stroke()
    }
    for (let y = 24; y < height; y += 56) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y + 24)
      context.stroke()
    }

    context.save()
    context.translate(snapshot.outletX, snapshot.outletY)
    context.rotate(Math.sin(snapshot.outletX / 90) * 0.08)
    context.fillStyle = '#f4a261'
    context.strokeStyle = '#fff1b8'
    context.lineWidth = 4
    context.beginPath()
    context.roundRect(-24, -20, 48, 40, 10)
    context.fill()
    context.stroke()
    context.fillStyle = '#2b2440'
    context.beginPath()
    context.arc(-9, -2, 4, 0, Math.PI * 2)
    context.arc(9, -2, 4, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = '#2b2440'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(-9, 9)
    context.quadraticCurveTo(0, 15, 9, 9)
    context.stroke()
    context.restore()

    context.save()
    context.translate(snapshot.playerX, snapshot.playerY)
    context.fillStyle = '#74d7ff'
    context.strokeStyle = '#f7f0c7'
    context.lineWidth = 4
    context.beginPath()
    context.arc(0, 0, 18, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.fillStyle = '#1d274c'
    context.beginPath()
    context.arc(-6, -2, 2.7, 0, Math.PI * 2)
    context.arc(6, -2, 2.7, 0, Math.PI * 2)
    context.fill()
    context.restore()

    if (snapshot.status !== 'PLAYING') {
      context.fillStyle = 'rgba(15, 13, 33, 0.62)'
      context.fillRect(0, 0, width, height)
    }
  }, [snapshot])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-label="逃げるコンセントのゲーム画面"
      className="block w-full rounded-[1.4rem] border-4 border-[#fff1b8] bg-[#161326] shadow-[8px_8px_0_#f4a261]"
    />
  )
}
