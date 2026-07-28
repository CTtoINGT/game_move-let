import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GameCanvas } from '@/components/game-canvas'
import { useGameSocket } from '@/hooks/use-game-socket'

const playableKeys = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'])

function eventLabel(event: string) {
  if (event === 'JACKPOT') return 'JACKPOT! 5 COMBO!'
  if (event === 'CAPTURE') return 'GET! コンセントをつかまえた'
  if (event === 'TIME_UP') return 'TIME UP!'
  if (event === 'START') return 'GO! 60秒の追跡開始'
  return 'SPACEでスタート'
}

function App() {
  const { connected, snapshot, start, restart, sendInput } = useGameSocket()
  const heldKeys = useRef(new Set<string>())

  useEffect(() => {
    const syncInput = () => sendInput([...heldKeys.current])
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === ' ' && snapshot.status !== 'PLAYING') {
        event.preventDefault()
        start()
        return
      }
      if (playableKeys.has(key)) {
        event.preventDefault()
        heldKeys.current.add(key)
        syncInput()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (playableKeys.has(key)) {
        heldKeys.current.delete(key)
        syncInput()
      }
    }
    const onBlur = () => {
      heldKeys.current.clear()
      syncInput()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [sendInput, snapshot.status, start])

  const timeSeconds = Math.ceil(snapshot.remainingMillis / 1_000)
  const comboPercent = Math.min(100, snapshot.comboRemainingMillis / 30)

  return (
    <main className="min-h-screen overflow-hidden bg-[#161326] px-4 py-6 text-[#fff7dd] selection:bg-[#ff6b6b] selection:text-white sm:py-10">
      <section className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-black tracking-[0.24em] text-[#f4a261]">INDIE ARCADE</p>
            <h1 className="m-0 font-black tracking-tight text-4xl text-[#fff1b8] sm:text-5xl">コンセント・チェイス</h1>
          </div>
          <Badge className={connected ? 'bg-[#74d7ff] text-[#161326]' : 'bg-[#ff6b6b] text-white'}>
            {connected ? 'JAVA ENGINE CONNECTED' : 'CONNECTING...'}
          </Badge>
        </header>

        <Card className="border-4 border-[#fff1b8] bg-[#27214b]/95 shadow-[10px_10px_0_#74d7ff]">
          <CardContent className="p-3 sm:p-5">
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="SCORE" value={snapshot.score.toLocaleString()} tone="text-[#fff1b8]" />
              <Stat label="COMBO" value={`x${snapshot.combo}`} tone="text-[#f4a261]" />
              <Stat label="TIME" value={`${timeSeconds}s`} tone="text-[#74d7ff]" />
              <div className="rounded-2xl border-2 border-dashed border-[#fff1b8]/60 bg-[#161326]/70 px-3 py-2">
                <p className="m-0 text-[0.65rem] font-black tracking-widest text-[#fff1b8]/70">COMBO FUSE</p>
                <Progress value={comboPercent} className="mt-2 h-2 bg-[#514a70] [&>[data-slot=progress-indicator]]:bg-[#f4a261]" />
              </div>
            </div>

            <div className="relative">
              <GameCanvas snapshot={snapshot} />
              <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border-2 border-dashed border-[#fff1b8]/70 bg-[#161326]/80 px-3 py-2 text-center font-black text-sm sm:text-base">
                {eventLabel(snapshot.event)}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-sm font-semibold text-[#fff1b8]/80">矢印キー / WASD で追いかける。3秒以内の連続捕獲でコンボ継続。</p>
              <Button
                type="button"
                disabled={!connected}
                onClick={snapshot.status === 'PLAYING' ? undefined : snapshot.status === 'FINISHED' ? restart : start}
                className="h-11 rounded-xl border-2 border-[#fff1b8] bg-[#ff6b6b] px-5 font-black text-white shadow-[4px_4px_0_#fff1b8] hover:bg-[#ff847c]"
              >
                {snapshot.status === 'FINISHED' ? 'もう一回！' : snapshot.status === 'PLAYING' ? 'PLAYING...' : 'ゲーム開始'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#fff1b8]/60 bg-[#161326]/70 px-3 py-2">
      <p className="m-0 text-[0.65rem] font-black tracking-widest text-[#fff1b8]/70">{label}</p>
      <p className={`m-0 mt-1 font-black text-2xl ${tone}`}>{value}</p>
    </div>
  )
}

export default App
