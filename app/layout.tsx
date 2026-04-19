import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nigeria Tax Calculator — 2025 Tax Act',
  description: 'CIT, VAT & WHT calculator based on the Nigeria Tax Act 2025 (Tinubu reform)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
