import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'PedalUp — TIET Cycle Bazaar',
  description: 'Buy and sell pre-loved bicycles within Thapar Institute campus. Safe, verified, and exclusively for TIET students.',
  keywords: ['cycles', 'bicycles', 'TIET', 'Thapar', 'marketplace', 'campus'],
  openGraph: {
    title: 'PedalUp — TIET Cycle Bazaar',
    description: 'Campus cycle resale marketplace for TIET students',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '64px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
