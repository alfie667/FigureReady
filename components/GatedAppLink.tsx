'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCapturedEmail } from '@/lib/emailGate'
import EmailGateModal from '@/components/EmailGateModal'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function GatedAppLink({ children, className }: Props) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (getCapturedEmail()) {
      router.push('/app')
    } else {
      setShowModal(true)
    }
  }

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      {showModal && (
        <EmailGateModal
          title="Get free access"
          description="Enter your email to access FigureReady. No account needed."
          cta="Start for free →"
          onConfirm={() => router.push('/app')}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
