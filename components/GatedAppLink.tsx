'use client'

import Link from 'next/link'
import { trackUploadCtaClick } from '@/lib/analytics'

interface Props {
  children: React.ReactNode
  className?: string
  location?: string
  href?: string
}

export default function GatedAppLink({ children, className, location = 'unknown', href = '/app' }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackUploadCtaClick(location)}
    >
      {children}
    </Link>
  )
}
