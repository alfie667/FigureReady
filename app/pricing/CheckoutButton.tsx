'use client'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

export function CheckoutButton({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  function handleClick() {
    window.fbq?.('track', 'InitiateCheckout')
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
