import type { DataTableProperty } from '@/lib/notion/types'
import { cn } from '@/lib/utils'
import type { FC } from 'react'
import { PropertyIcon } from '../notion-data-table/property-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export type PropertySelectProps = {
  value: string
  onValueChange: (value: string) => void
  properties: {
    key: string
    type: DataTableProperty['type']
  }[]
  className?: string
}

export const PropertySelect: FC<PropertySelectProps> = ({
  onValueChange,
  properties,
  value,
  className,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'h-7 shrink-0 overflow-hidden p-1 pl-1.5 [&>svg]:shrink-0',
          className,
        )}
      >
        <SelectValue placeholder="Property" />
      </SelectTrigger>
      <SelectContent>
        {properties.map(({ key, type }) => (
          <SelectItem key={key} value={key}>
            <div className="flex max-w-60 flex-nowrap items-center overflow-hidden">
              <PropertyIcon
                type={type}
                className="mr-1.5 size-4 text-muted-foreground"
              />
              <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
                {key}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
