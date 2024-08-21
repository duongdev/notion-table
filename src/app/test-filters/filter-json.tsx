'use client'

import { buildNotionFilter } from '@/components/data-table-toolbar/data-table-filters/utils'
import { useDataTableStore } from '@/stores/data-table-provider'
import type { FC } from 'react'

export type FilterJsonProps = {}

export const FilterJson: FC<FilterJsonProps> = () => {
  const filters = useDataTableStore((state) => state.filters)

  return <pre>{JSON.stringify(buildNotionFilter(filters), null, 2)}</pre>
}
