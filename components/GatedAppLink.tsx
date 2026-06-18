'use client'
import { useRouter } from 'next/navigation'

const TALLY_FORM_ID = '9qx9y4'
const SESSION_KEY = 'figureready-email-captured'

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: Record<string, unknown>) => void
    }
  }
}

interface Props {
  children: React.ReactNode
  className?: string
}

export default function GatedAppLink({ children, className }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (typeof window === 'undefined') return

    if (sessionStorage.getItem(SESSION_KEY)) {
      router.push('/app')
      return
    }

    window.Tally?.openPopup(TALLY_FORM_ID, {
      onSubmit: () => {
        sessionStorage.setItem(SESSION_KEY, '1')
        setTimeout(() => router.push('/app'), 1000)
      },
    })
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
