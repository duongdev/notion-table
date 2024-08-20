import { Header } from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { queryNotionDatabase } from '@/lib/notion/client'
import { DataTableStoreProvider } from '@/stores/data-table-provider'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'

import './globals.css'

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistMono.variable} ${GeistSans.variable}`}
    >
      <head />
      <body>
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
