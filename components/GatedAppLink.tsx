import Link from 'next/link'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function GatedAppLink({ children, className }: Props) {
  return (
    <Link href="/app" className={className}>
      {children}
    </Link>
  )
}
