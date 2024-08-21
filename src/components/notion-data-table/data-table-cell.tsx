import type { DataTableProperties } from '@/lib/notion/types'
import { isEqual } from 'lodash-es'
import { type FC, memo } from 'react'
import { Checkbox } from '../ui/checkbox'
import { PropertySelectItem } from './property-select-item'

export type DataTableCellProps = { property: DataTableProperties[string] }

export const DataTableCell: FC<DataTableCellProps> = ({ property }) => {
  switch (property.type) {
    case 'title':
      return <div className="font-semibold">{property.title[0].plain_text}</div>
    case 'select':
      return property.select ? (
        <PropertySelectItem
          name={property.select.name}
          color={property.select.color}
        />
      ) : null
    case 'multi_select':
      return (
        <div className="flex flex-row flex-wrap gap-1.5 overflow-auto">
          {property.multi_select.map((select) => (
            <PropertySelectItem
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

export const MemoizedDataTableCell = memo(DataTableCell, (prev, next) => {
  return isEqual(prev.property, next.property)
})
