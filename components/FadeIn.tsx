'use client'
import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number        // ms — stagger cards
  distance?: number     // px — how far it slides up
}

export default function FadeIn({ children, className, delay = 0, distance = 28 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Set initial state
    el.style.opacity = '0'
    el.style.transform = `translateY(${distance}px)`
    el.style.transition = `opacity 0.7s ease, transform 0.7s ease`
    el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.08 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, distance])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
