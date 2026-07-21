'use client'

import Link from 'next/link'
import { gtagEvent } from '@/lib/ga'

interface Props {
  children: React.ReactNode
  className?: string
  location?: string
}

export default function GatedAppLink({ children, className, location = 'unknown' }: Props) {
  return (
    <Link
      href="/app"
      className={className}
      onClick={() => gtagEvent('cta_click', { location })}
    >
      {children}
    </Link>
  )
}
