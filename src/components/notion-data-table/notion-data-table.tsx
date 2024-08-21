'use client'

import type { DataTableProperties } from '@/lib/notion/types'
import { useDataTableStore } from '@/stores/data-table-provider'
import type { FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { DataTableToolbar } from '../data-table-toolbar/data-table-toolbar'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { DataTable } from './data-table'

export type NotionDataTableProps = {}

export const NotionDataTable: FC<NotionDataTableProps> = () => {
  const { isLoaded, isLoading, entities, clearFilters, fetchNotionData } =
    useDataTableStore(
      useShallow((state) => ({
        isLoaded: state.isLoaded,
        entities: state.entities,
        clearFilters: state.clearFilters,
        fetchNotionData: state.fetchNotionData,
        isLoading: state.isFetching,
      })),
    )

  const handleClearFilters = () => {
    clearFilters()
    fetchNotionData()
  }

  const data = entities
    .filter((entity) => !(entity.archived || entity.in_trash))
    .map((entity) => ({
      id: entity.id,
      ...entity.properties,
    })) as (DataTableProperties & { id: string })[]

  if (!isLoaded || (isLoading && !data.length)) {
    return (
      <div role="status" className="container grid place-items-center p-8">
        <Spinner />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div role="status" className="px-4 sm:px-8 md:px-24 ">
        <div className="grid place-items-center rounded-md border border-dashed bg-slate-50/80 p-8 dark:bg-slate-950">
          <div className="font-mono">No data</div>
          <div className="text-sm">
            Try{' '}
            <Button variant="link" className="p-0" onClick={handleClearFilters}>
              clear filter
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-8 md:px-24">
        <DataTableToolbar />
      </div>
      <DataTable data={data} />
    </>
  )
}
