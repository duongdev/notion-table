import { GitHubLogoIcon } from '@radix-ui/react-icons'
import type { FC } from 'react'
import { Button } from './ui/button'
import { ThemeToggler } from './ui/theme-toggler'

export type HeaderProps = {}

export const Header: FC<HeaderProps> = () => {
  return (
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
  )
}
