import type { CSSProperties } from 'react'

type SparkBurstProps = {
  burstKey: number
}

const sparks = ['✦', '✹', '●', '✦', '✹', '●', '✦', '✹']

export function SparkBurst({ burstKey }: SparkBurstProps) {
  if (burstKey === 0) return null

  return (
    <div key={burstKey} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.4rem]">
      {sparks.map((spark, index) => (
        <span
          key={`${burstKey}-${index}`}
          className="spark-burst absolute left-1/2 top-1/2 text-3xl text-[#fff1b8]"
          style={{
            '--spark-x': `${Math.cos((Math.PI * 2 * index) / sparks.length) * (90 + (index % 2) * 42)}px`,
            '--spark-y': `${Math.sin((Math.PI * 2 * index) / sparks.length) * (90 + (index % 3) * 28)}px`,
            animationDelay: `${index * 18}ms`,
          } as CSSProperties}
        >
          {spark}
        </span>
      ))}
    </div>
  )
}
