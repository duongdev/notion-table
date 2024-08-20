import type { DataTableProperties } from '@/lib/notion/types'
import { useTheme } from 'next-themes'
import type { FC } from 'react'
import { Checkbox } from '../ui/checkbox'

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

export type DataTableCellProps = { property: DataTableProperties[string] }

export const DataTableCell: FC<DataTableCellProps> = ({ property }) => {
  switch (property.type) {
    case 'title':
      return <div className="font-semibold">{property.title[0].plain_text}</div>
    case 'select':
      return property.select ? (
        <SelectItem name={property.select.name} color={property.select.color} />
      ) : null
    case 'multi_select':
      return (
        <div className="flex flex-row flex-wrap gap-1.5 overflow-auto">
          {property.multi_select.map((select) => (
            <SelectItem
              key={select.name}
              name={select.name}
              color={select.color}
            />
          ))}
        </div>
      )
    case 'rich_text':
      return (
        <div>
          {property.rich_text.map((text, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                fontWeight: text.annotations.bold ? 'bold' : 'normal',
                fontStyle: text.annotations.italic ? 'italic' : 'normal',
                textDecoration: text.annotations.underline
                  ? 'underline'
                  : 'none',
              }}
            >
              {text.plain_text}
            </span>
          ))}
        </div>
      )
    case 'number':
      return <div>{property.number}</div>
    case 'date':
      return (
        <div>
          {(property.date &&
            new Date(property.date.start).toLocaleDateString()) ||
            ''}
        </div>
      )
    case 'checkbox':
      return (
        <Checkbox checked={property.checkbox} className="cursor-not-allowed" />
      )
    default:
      return <div>{JSON.stringify(property)}</div>
  }
}

const SelectItem: FC<{ name: string; color: string }> = ({ name, color }) => {
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
