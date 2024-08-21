'use client'

import { cn } from '@/lib/utils'
import type { FC } from 'react'

export type PropertySelectItemProps = { name: string; color?: string }

export const PropertySelectItem: FC<PropertySelectItemProps> = ({
  name,
  color = 'default',
}) => {
  return (
    <span
      className={cn(
        'text-nowrap rounded-md bg-opacity-40 px-2.5 py-0.5 font-medium text-foreground text-xs transition-colors dark:bg-opacity-100',
        color === 'default' && 'bg-slate-400 dark:bg-slate-500',
        color === 'blue' && 'bg-blue-500 dark:bg-blue-800',
        color === 'brown' && 'bg-brown-500 dark:bg-brown-800',
        color === 'gray' && 'bg-gray-500 dark:bg-gray-800',
        color === 'green' && 'bg-green-500 dark:bg-green-800',
        color === 'orange' && 'bg-orange-500 dark:bg-orange-800',
        color === 'pink' && 'bg-pink-500 dark:bg-pink-800',
        color === 'purple' && 'bg-purple-500 dark:bg-purple-800',
        color === 'red' && 'bg-red-500 dark:bg-red-800',
        color === 'yellow' && 'bg-yellow-500 dark:bg-yellow-800',
      )}
    >
      {name}
    </span>
  )
}
