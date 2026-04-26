import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthButton from '@/components/shared/AuthButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Epic Dreams Academy — AI Cinematic Studio',
  description: 'Plataforma de producción cinematográfica asistida por IA. Genera guiones, planos y lenguaje visual con agentes especializados.',
  openGraph: {
    title: 'Epic Dreams Academy',
    description: 'AI-powered cinematic production studio',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-[#050505]">
        <header className="absolute top-0 right-0 p-4 z-50">
          <AuthButton />
        </header>
        {children}
      </body>
    </html>
  )
}