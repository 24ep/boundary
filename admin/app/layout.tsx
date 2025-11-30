import type { Metadata } from 'next'
import './globals.css'
import '../styles/content-studio.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

export const metadata: Metadata = {
  title: 'Bondarys CMS',
  description: 'Content Management System for Bondarys Family Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}