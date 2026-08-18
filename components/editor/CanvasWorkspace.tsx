'use client'

interface Props {
  children: React.ReactNode
}

export default function CanvasWorkspace({ children }: Props) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC] min-w-0">
      {/*
        Desktop: the inner div becomes the "white figure sheet" —
        20px inset margin, rounded corners, very subtle shadow.
        Mobile: no margin, no white card, just the raw flex container.
        The 20px margin ensures the box-shadow (max 12px) isn't clipped
        by the parent's overflow-hidden.
      */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:m-5 md:bg-white md:rounded-[20px] md:border md:border-[#E2E8F0] md:shadow-[0_2px_12px_0_rgba(15,23,42,0.07)]">
        {children}
      </div>
    </main>
  )
}
