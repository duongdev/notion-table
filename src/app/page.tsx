import { NotionDataTable } from '@/components/notion-data-table/notion-data-table'
import { ArrowTopRightIcon } from '@radix-ui/react-icons'
import type { FC } from 'react'

export type PageProps = {}

const Page: FC<PageProps> = () => {
  return (
    <div className="space-y-4 pb-8">
      <div className="px-4 text-2xl sm:px-8 md:px-24">
        Genshin Impact Characters
      </div>
      <NotionDataTable />
      <div className="text-center">
        <a
          href="https://www.kaggle.com/datasets/ngtengsuan/genshin-impact-characters-dataset"
          rel="noopener noreferrer"
          target="_blank"
          className="inline-flex items-center border-muted border-b border-dashed text-muted-foreground text-xs transition-colors hover:border-foreground hover:text-foreground"
        >
          Source: Kaggle
          <ArrowTopRightIcon className="ml-1 size-3" />
        </a>
      </div>
    </div>
  )
}

export default Page
