import { DataTableFilters } from '@/components/data-table-toolbar/data-table-filters/data-table-filters'
import type { FC } from 'react'
import { FilterJson } from './filter-json'

export type PageProps = {}

const Page: FC<PageProps> = () => {
  return (
    <div className="container flex">
      <div className="flex-1">
        <DataTableFilters maxDepth={10} />
      </div>
      <div className="flex-1">
        <FilterJson />
      </div>
    </div>
  )
}

Page.displayName = 'TestFiltersPage'

export default Page
