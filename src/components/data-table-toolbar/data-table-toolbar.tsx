'use client'

import type { FC } from 'react'
import { Separator } from '../ui/separator'
import { DataTableFilters } from './data-table-filters/data-table-filters'
import { DataTableSorts } from './data-table-sorts'

export type DataTableToolbarProps = {}

export const DataTableToolbar: FC<DataTableToolbarProps> = () => {
  return (
    <div className="flex h-5 items-center gap-2">
      <DataTableFilters />
      <Separator orientation="vertical" />
      <DataTableSorts />
    </div>
  )
}
