import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

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
      <body className="font-sans antialiased">
        <ClerkProvider>
          <header className="p-4 flex gap-4 justify-end">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}