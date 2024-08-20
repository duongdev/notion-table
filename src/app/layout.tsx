import { Header } from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { DataTableStoreProvider } from '@/stores/data-table-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { queryNotionDatabase } from '@/lib/notion/client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Genshin Impact Characters',
  description: 'Genshin Impact Characters Dataset',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const entities = await queryNotionDatabase()

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
          <DataTableStoreProvider entities={entities}>
            <Header />
            {children}
          </DataTableStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
