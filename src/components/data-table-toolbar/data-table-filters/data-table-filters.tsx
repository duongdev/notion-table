'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useDataTableStore } from '@/stores/data-table-provider'
import { MixerVerticalIcon, TrashIcon } from '@radix-ui/react-icons'
import { type FC, useCallback, useState } from 'react'
import { Button } from '../../ui/button'
import { FilterEditor } from './filter-editor'
import { isBaseFilter } from './utils'

export type DataTableFiltersProps = {
  maxDepth?: number
}

export const DataTableFilters: FC<DataTableFiltersProps> = () => {
  const [isOpen, setIsOpen] = useState(false)
  const fetchNotionData = useDataTableStore((state) => state.fetchNotionData)
  const isFetching = useDataTableStore((state) => state.isFetching)
  const baseFilterLength = useDataTableStore(
    (state) => Object.values(state.filters).filter(isBaseFilter).length,
  )
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        fetchNotionData()
      }
    },
    [fetchNotionData],
  )

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={isFetching}
          variant="ghost"
          size="sm"
          className={cn(
            'px-1.5 py-1 text-muted-foreground hover:text-foreground',
            'border border-dashed',
            baseFilterLength > 0 && 'text-foreground',
          )}
        >
          <MixerVerticalIcon className="mr-1 size-3" /> Add filter
          {baseFilterLength > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1.5 h-4" />{' '}
              <div className="inline-grid place-items-center rounded-sm bg-muted px-1.5 py-0.5 font-normal text-xs">
                {baseFilterLength}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-[700px] max-w-screen-md p-1"
      >
        <FilterEditor parentFilter={null} />
        {/* <AddFilterMenu /> */}
        <Separator className="my-0.5" />
        <DeleteFilters baseFilterLength={baseFilterLength} />
        {/* <SortList className="my-1 flex-1" />
        <AddSort />
        <DeleteSort /> */}
      </PopoverContent>
    </Popover>
  )
}

const DeleteFilters: FC<{ baseFilterLength: number }> = ({
  baseFilterLength,
}) => {
  const clearFilters = useDataTableStore((state) => state.clearFilters)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleClick = () => {
    if (isConfirming) {
      clearFilters()
      setIsConfirming(false)
    } else {
      setIsConfirming(true)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-full justify-start px-2 text-muted-foreground hover:text-destructive"
      disabled={baseFilterLength === 0}
      onClick={handleClick}
      onMouseLeave={() => setIsConfirming(false)}
    >
      <TrashIcon className="mr-2 size-4" />{' '}
      {isConfirming ? 'Confirm?' : 'Delete filters'}
    </Button>
  )
}
