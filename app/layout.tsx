import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zen-OS | AI-Powered Portfolio',
  description: 'Personal OS-style portfolio with high-availability AI orchestration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[hsl(250,100%,99%)] text-[hsl(215,15%,15%)] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
