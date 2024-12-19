import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { TopNav } from './components/top-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuildWithCode',
  description: 'Manage your web design projects efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <TopNav />
            <main className="p-4">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}