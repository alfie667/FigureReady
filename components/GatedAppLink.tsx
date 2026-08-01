'use client'

import Link from 'next/link'
import { trackUploadCtaClick } from '@/lib/analytics'

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
      onClick={() => trackUploadCtaClick(location)}
    >
      {children}
    </Link>
  )
}
