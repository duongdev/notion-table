import { Header } from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { DataTableStoreProvider } from '@/stores/data-table-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Genshin Impact Characters',
  description: 'Genshin Impact Characters Dataset',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DataTableStoreProvider>
            <Header />
            {children}
          </DataTableStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
