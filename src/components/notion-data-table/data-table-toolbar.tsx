'use client'

import { useDataTableStore } from '@/stores/data-table-provider'
import {
  Cross2Icon,
  LineHeightIcon,
  MixerVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import clsx from 'clsx'
import { type FC, useCallback, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { PropertyIcon } from './property-icon'

export type DataTableToolbarProps = {}

export const DataTableToolbar: FC<DataTableToolbarProps> = () => {
  return (
    <div className="flex h-5 items-center gap-2">
      <SortToolbar />
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

const SortToolbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const fetchNotionData = useDataTableStore((state) => state.fetchNotionData)
  const sorts = useDataTableStore((state) => state.sorts)
  const isFetching = useDataTableStore((state) => state.isFetching)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      fetchNotionData()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={isFetching}
          variant="ghost"
          size="sm"
          className={clsx(
            'px-1.5 py-1 text-muted-foreground hover:text-foreground',
            'border border-dashed',
          )}
        >
          <LineHeightIcon className="mr-1 size-3" /> Add sort
          {sorts.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1.5 h-4" />{' '}
              <div className="inline-grid place-items-center rounded-sm bg-muted px-1.5 py-0.5 font-normal text-xs">
                {sorts.length}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 p-1">
        <SortList className="mb-2 flex-1" />
        <AddSort />
        <DeleteSort />
      </PopoverContent>
    </Popover>
  )
}

const DeleteSort: FC = () => {
  const sorts = useDataTableStore((state) => state.sorts)
  const setSorts = useDataTableStore((state) => state.setSorts)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleClick = () => {
    if (isConfirming) {
      setSorts([])
      setIsConfirming(false)
    } else {
      setIsConfirming(true)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="w-full justify-start px-2 text-muted-foreground hover:text-destructive"
      disabled={sorts.length === 0}
      onClick={handleClick}
      onMouseLeave={() => setIsConfirming(false)}
    >
      <TrashIcon className="mr-1 size-4" />{' '}
      {isConfirming ? 'Confirm?' : 'Delete sorts'}
    </Button>
  )
}

const AddSort: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { properties, sorts, setSorts } = useDataTableStore((state) => ({
    properties: state.properties,
    sorts: state.sorts,
    setSorts: state.setSorts,
  }))

  const sortables = useMemo(() => {
    return Object.entries(properties)
      .map(([key, value]) => ({
        key,
        type: value.type,
      }))
      .filter(({ key }) => !sorts.some((sort) => sort.property === key))
  }, [properties, sorts])

  const handleAddSort = useCallback(
    (key: string) => {
      setIsOpen(false)
      setSorts([...sorts, { property: key, direction: 'ascending' }])
    },
    [setSorts, sorts],
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start px-2 text-muted-foreground"
        >
          <PlusIcon className="mr-1 size-4" /> Add sort
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className="w-60 p-1">
        {sortables.map(({ key, type }) => (
          <Button
            key={key}
            size="sm"
            variant="ghost"
            className="w-full items-center justify-start px-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleAddSort(key)}
          >
            <PropertyIcon type={type} className="mr-1.5 size-4 " />
            {key}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

const SortList: FC<{ className?: string }> = ({ className }) => {
  const { sorts, setSorts } = useDataTableStore((state) => ({
    sorts: state.sorts,
    setSorts: state.setSorts,
  }))

  const handleRemoveSort = useCallback(
    (index: number) => {
      const newSorts = [...sorts]
      newSorts.splice(index, 1)
      setSorts(newSorts)
    },
    [sorts, setSorts],
  )

  const handleChangeSort = useCallback(
    (
      index: number,
      props: { property: string; direction: 'ascending' | 'descending' },
    ) => {
      const newSorts = [...sorts]
      newSorts[index] = props
      setSorts(newSorts)
    },
    [sorts, setSorts],
  )

  if (sorts.length === 0) {
    return (
      <div className="flex h-[36px] items-center px-3 text-muted-foreground text-xs">
        No sorts applied
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={clsx('flex flex-col gap-1', className)}>
        {sorts.map((sort, index) => (
          <SortItem
            key={sort.property}
            property={sort.property}
            direction={sort.direction}
            onRemove={() => handleRemoveSort(index)}
            onChange={(props) => handleChangeSort(index, props)}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}

const SortItem: FC<{
  property: string
  direction: 'ascending' | 'descending'
  onRemove: () => void
  onChange: (props: {
    property: string
    direction: 'ascending' | 'descending'
  }) => void
}> = ({ property, direction, onChange, onRemove }) => {
  const { sorts, properties } = useDataTableStore((state) => ({
    sorts: state.sorts,
    properties: state.properties,
  }))

  const sortables = useMemo(() => {
    return Object.entries(properties)
      .map(([key, value]) => ({
        key,
        type: value.type,
      }))
      .filter(
        ({ key }) =>
          key === property || !sorts.some((sort) => sort.property === key),
      )
  }, [properties, sorts, property])

  return (
    <div className="flex items-center gap-1">
      <Select
        value={property}
        onValueChange={(value) => {
          onChange({ property: value, direction })
        }}
      >
        <SelectTrigger className="h-7 w-[180px] flex-1 overflow-hidden p-1 pl-1.5 [&>svg]:shrink-0">
          <SelectValue placeholder="Property" />
        </SelectTrigger>
        <SelectContent>
          {sortables.map(({ key, type }) => (
            <SelectItem key={key} value={key}>
              <div className="flex max-w-60 flex-nowrap items-center overflow-hidden">
                <PropertyIcon
                  type={type}
                  className="mr-1.5 size-4 text-muted-foreground"
                />
                <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
                  {key}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={direction}
        onValueChange={(value) => {
          onChange({ property, direction: value as 'ascending' | 'descending' })
        }}
      >
        <SelectTrigger className="h-7 w-[180px] flex-1 overflow-hidden p-1 pl-2 [&>svg]:shrink-0">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ascending">
            <span className="flex items-center text-xs">Ascending</span>
          </SelectItem>
          <SelectItem value="descending">
            <span className="flex items-center text-xs">Descending</span>
          </SelectItem>
        </SelectContent>
      </Select>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={null}
            variant="ghost"
            className="mx-1 shrink-0 p-1 text-muted-foreground"
            onClick={onRemove}
          >
            <Cross2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove sort rule</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
