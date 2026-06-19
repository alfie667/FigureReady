'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TALLY_FORM_ID = '9qx9y4'
const SESSION_KEY = 'figureready-email-captured'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function GatedAppLink({ children, className }: Props) {
  const [showGate, setShowGate] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!showGate) return

    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (data?.event === 'Tally Form Submitted') {
          sessionStorage.setItem(SESSION_KEY, '1')
          setShowGate(false)
          router.push('/app')
        }
      } catch {}
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [showGate, router])

  const handleClick = () => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      router.push('/app')
      return
    }
    setShowGate(true)
  }

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md" style={{ height: 420 }}>
            <iframe
              src={`https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=0&transparentBackground=0`}
              width="100%"
              height="100%"
              frameBorder={0}
              title="Get early access to FigureReady"
            />
          </div>
        </div>
      )}
    </>
  )
}
