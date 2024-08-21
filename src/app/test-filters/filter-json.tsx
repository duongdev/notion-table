'use client'

import { buildNotionFilter } from '@/components/data-table-toolbar/data-table-filters/helpers'
import type {
  CompoundFilter,
  Filter,
} from '@/components/data-table-toolbar/data-table-filters/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataTableStore } from '@/stores/data-table-provider'
import type { ANY } from '@/types'
import type { FC } from 'react'

export type FilterJsonProps = {}

const getNotionFilter = (filters: Record<string, Filter>) => {
  try {
    return buildNotionFilter(
      filters,
      null,
      (filters.root as CompoundFilter).isNegated,
    )
  } catch (e) {
    return (e as ANY).message
  }
}

export const FilterJson: FC<FilterJsonProps> = () => {
  const filters = useDataTableStore((state) => state.filters)

  return (
    <Tabs defaultValue="notion" className="mt-40 w-[400px]">
      <TabsList>
        <TabsTrigger value="state">State</TabsTrigger>
        <TabsTrigger value="notion">Notion filter</TabsTrigger>
      </TabsList>
      <TabsContent value="state">
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </TabsContent>
      <TabsContent value="notion">
        <pre>{JSON.stringify(getNotionFilter(filters), null, 2)}</pre>
      </TabsContent>
    </Tabs>
  )
}
