import { DataTableToolbar } from '@/components/notion-data-table/data-table-toolbar'
import { NotionDataTable } from '@/components/notion-data-table/notion-data-table'
import type { FC } from 'react'

export type PageProps = {}

const Page: FC<PageProps> = () => {
  return (
    <div className="space-y-4 pb-8">
      <div className="px-4 text-2xl sm:px-8 md:px-24">
        Genshin Impact Characters
      </div>
      <div className="px-4 sm:px-8 md:px-24">
        <DataTableToolbar />
      </div>
      <NotionDataTable />
    </div>
  )
}

export default Page
