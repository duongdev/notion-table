import { NotionDataTable } from '@/components/notion-data-table/notion-data-table'
import type { FC } from 'react'

export type PageProps = {}

const Page: FC<PageProps> = async () => {
  return (
    <div className="space-y-4 pb-8">
      <div className="px-4 sm:px-8 md:px-24">
        <div className="text-2xl">Genshin Impact Characters</div>
      </div>
      <NotionDataTable />
    </div>
  )
}

export default Page
