import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Pedal Up — TIET Cycle Marketplace',
  description: 'Buy, sell and rent pre-loved bicycles within Thapar Institute campus. Verified students only, zero commission, exclusively for TIET.',
  keywords: ['cycles', 'bicycles', 'TIET', 'Thapar', 'marketplace', 'campus', 'rent', 'buy', 'sell'],
  openGraph: {
    title: 'Pedal Up — TIET Cycle Marketplace',
    description: 'Campus cycle marketplace for TIET students. Buy, sell and rent cycles.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900;1,14..32,400&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
