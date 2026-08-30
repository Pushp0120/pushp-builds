import type { Metadata } from 'next'
import { Space_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Pushp Builds — Premium Web & App Development',
  description: 'Professional full-stack developer creating premium digital solutions. From landing pages to full-stack applications with modern design and cutting-edge technology.',
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
