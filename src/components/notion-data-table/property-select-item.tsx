import { useTheme } from 'next-themes'
import type { FC } from 'react'

export const notionColors: Record<string, string> = {
  blue: '#0369a1',
  brown: '#450a0a',
  default: '#27272a',
  gray: '#1f2937',
  green: '#065f46',
  orange: '#b45309',
  pink: '#be185d',
  purple: '#5b21b6',
  red: '#dc2626',
  yellow: '#ca8a04',
}

export type PropertySelectItemProps = { name: string; color?: string }

export const PropertySelectItem: FC<PropertySelectItemProps> = ({
  name,
  color = 'default',
}) => {
  const { resolvedTheme } = useTheme()

  return (
    <span
      style={{
        backgroundColor: `${notionColors[color] || notionColors.default}${resolvedTheme !== 'dark' ? '40' : ''}`,
      }}
      className="text-nowrap rounded-md px-2.5 py-0.5 font-medium text-foreground text-xs transition-colors"
    >
      {name}
    </span>
  )
}
