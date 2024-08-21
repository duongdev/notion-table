'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useDataTableStore } from '@/stores/data-table-provider'
import {
  ExclamationTriangleIcon,
  MixerVerticalIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { type FC, useCallback, useState } from 'react'
import { Button } from '../../ui/button'
import { FilterEditor } from './filter-editor'
import { buildNotionFilter, isBaseFilter } from './helpers'
import type { CompoundFilter } from './types'

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
  const clearFilters = useDataTableStore((state) => state.clearFilters)
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        fetchNotionData()
      }
    },
    [fetchNotionData],
  )

  const handleClearFilters = () => {
    setIsOpen(false)
    clearFilters()
    fetchNotionData()
  }

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
        className="w-auto min-w-[800px] max-w-screen-md p-1"
      >
        <FilterEditor parentFilter={null} />
        <Separator className="my-0.5" />
        <DeleteFilters
          disabled={baseFilterLength === 0}
          onDelete={handleClearFilters}
        />
        <FilterError />
      </PopoverContent>
    </Popover>
  )
}

const FilterError: FC = () => {
  const filters = useDataTableStore((state) => state.filters)
  const notionFilter = buildNotionFilter(
    filters,
    null,
    (filters.root as CompoundFilter).isNegated,
  )

  if (!notionFilter.error) {
    return null
  }

  return (
    <Alert variant="destructive" className="px-2 py-2">
      <AlertDescription className="flex gap-2 text-xs">
        <ExclamationTriangleIcon className="h-4 w-4" />
        {notionFilter.error}
      </AlertDescription>
    </Alert>
  )
}

const DeleteFilters: FC<{ disabled?: boolean; onDelete: () => void }> = ({
  onDelete,
  disabled,
}) => {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleClick = () => {
    if (isConfirming) {
      onDelete()
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
      disabled={disabled}
      onClick={handleClick}
      onMouseLeave={() => setIsConfirming(false)}
    >
      <TrashIcon className="mr-2 size-4" />{' '}
      {isConfirming ? 'Confirm?' : 'Delete filters'}
    </Button>
  )
}
