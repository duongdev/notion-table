'use client'

import type { DataTableProperties } from '@/lib/notion/types'
import { useDataTableStore } from '@/stores/data-table-provider'
import type { FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Spinner } from '../ui/spinner'
import { DataTable } from './data-table'

export type NotionDataTableProps = {}

export const NotionDataTable: FC<NotionDataTableProps> = () => {
  const { isLoaded, entities } = useDataTableStore(
    useShallow((state) => ({
      isLoaded: state.isLoaded,
      entities: state.entities,
    })),
  )

  if (!isLoaded) {
    return (
      <div role="status" className="container grid place-items-center p-8">
        <Spinner />
      </div>
    )
  }

  const data = entities
    .filter((entity) => !(entity.archived || entity.in_trash))
    .map((entity) => ({
      id: entity.id,
      ...entity.properties,
    })) as (DataTableProperties & { id: string })[]

  return <DataTable data={data} />
}
