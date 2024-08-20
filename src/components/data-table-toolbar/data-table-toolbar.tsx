'use client'

import { MixerVerticalIcon } from '@radix-ui/react-icons'
import type { FC } from 'react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { DataTableSorts } from './data-table-sorts'

export type DataTableToolbarProps = {}

export const DataTableToolbar: FC<DataTableToolbarProps> = () => {
  return (
    <div className="flex h-5 items-center gap-2">
      <DataTableSorts />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        size="sm"
        className="px-1.5 py-1 text-muted-foreground hover:text-foreground"
      >
        <MixerVerticalIcon className="mr-1 size-3" /> Add filter
      </Button>
    </div>
  )
}
