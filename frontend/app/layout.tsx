import type { Metadata } from 'next'
import './globals.css' // si tienes estilos globales

export const metadata: Metadata = {
  title: 'Epic Dreams Academy',
  description: 'Plataforma de aprendizaje cinematográfico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}