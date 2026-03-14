import type { Metadata } from 'next'
import { Space_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'DevFolio — Affordable Web & App Development',
  description: '3rd Year BCA Student building affordable web apps, websites, and custom software. Submit your project and get a quote within 24 hours.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${spaceMono.variable}`} style={{ fontFamily: 'var(--font-syne), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
