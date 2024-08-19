import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggler } from '@/components/ui/theme-toggler'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

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
          <>
            <div className="flex flex-row items-center justify-between p-4 pl-2">
              <Button asChild variant="ghost">
                <a
                  href="https://github.com/duongdev/notion-table"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubLogoIcon className="mr-2 size-5" />
                  @duongdev/notion-table
                </a>
              </Button>
              <ThemeToggler />
            </div>
            {children}
          </>
        </ThemeProvider>
      </body>
    </html>
  )
}
