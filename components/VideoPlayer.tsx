'use client'
import { useRef, useCallback } from 'react'

export function VideoPlayer({ src, playbackRate = 0.7 }: { src: string; playbackRate?: number }) {
  const ref = useRef<HTMLVideoElement>(null)

  const applyRate = useCallback(() => {
    if (ref.current) ref.current.playbackRate = playbackRate
  }, [playbackRate])

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      onLoadedData={applyRate}
      onPlay={applyRate}
      className="w-full h-auto block"
    />
  )
}
