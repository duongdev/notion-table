import { PropertySelectItem } from '@/components/notion-data-table/property-select-item'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useDataTableStore } from '@/stores/data-table-provider'
import type { ANY } from '@/types'
import {
  CalendarIcon,
  CaretDownIcon,
  Cross2Icon,
  LayersIcon,
  PlusIcon,
} from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'
import { capitalize, get } from 'lodash-es'
import { type FC, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { PropertySelect } from '../property-select'
import {
  COMPOUND_OPERATOR,
  FILTER_CONFIG,
  MAX_FILTER_DEPTH,
} from './filter-config'
import { getFilterValueType, isBaseFilter } from './helpers'
import type {
  BaseFilter,
  CompoundFilter,
  Filter,
  FilterId,
  FilterType,
  FilterValueType,
} from './types'

export type FilterEditorProps = {
  parentFilter: Filter | null
  className?: string
}

export const FilterEditor: FC<FilterEditorProps> = ({
  parentFilter,
  className,
}) => {
  const allFilters = useDataTableStore((state) => state.filters)
  const parentId = parentFilter?.id ?? 'root'

  const filters = Object.values(allFilters).filter(
    (filter) => filter.parentId === parentId,
  )
  const depth = parentFilter ? parentFilter.depth + 1 : 0

  return (
    <div className={cn('space-y-1', className)}>
      <FilterList filters={filters} />
      <AddFilterMenu parentId={parentId} depth={depth} />
    </div>
  )
}

const FilterList: FC<{
  filters: Filter[]
}> = ({ filters }) => {
  if (!filters.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-1">
      {filters.map((filter, index) => (
        <FilterItem key={filter.id} filter={filter} filterIndex={index} />
      ))}
    </div>
  )
}

const FilterItem: FC<{ filter: Filter; filterIndex: number }> = ({
  filter,
  filterIndex,
}) => {
  const parentFilter = useDataTableStore((state) =>
    filter.parentId ? state.filters[filter.parentId] : null,
  )! as CompoundFilter
  const updateCompoundFilterOperator = useDataTableStore(
    (state) => state.updateCompoundFilterOperator,
  )
  const compoundOperator = useMemo(() => {
    if (filterIndex === 0) {
      return <NegationSelect />
    }

    if (filterIndex === 1) {
      return (
        <CompoundOperatorSelect
          value={parentFilter.operator}
          onValueChange={(value) =>
            updateCompoundFilterOperator(parentFilter.id, value)
          }
        />
      )
    }

    return (
      <div className="w-20 shrink-0 py-[5px] pr-1 text-right text-xs">
        {capitalize(parentFilter.operator)}
      </div>
    )
  }, [
    filterIndex,
    parentFilter.operator,
    parentFilter.id,
    updateCompoundFilterOperator,
  ])

  const filterItem = useMemo(() => {
    if (isBaseFilter(filter)) {
      return <BaseFilterItem filter={filter} className="flex-1" />
    }

    return (
      <FilterEditor
        parentFilter={filter}
        className="flex-1 rounded-md border border-slate-200 bg-slate-200/10 p-1 dark:border-slate-800 dark:bg-slate-800/20"
      />
    )
  }, [filter])

  return (
    <div className="flex flex-nowrap items-start gap-1">
      {compoundOperator}
      {filterItem}
      <DeleteFilterButton filterId={filter.id} />
    </div>
  )
}

const DeleteFilterButton: FC<{ filterId: FilterId }> = ({ filterId }) => {
  const deleteFilter = useDataTableStore((state) => state.deleteFilter)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={null}
            variant="ghost"
            className="mr-1 shrink-0 p-1 text-muted-foreground hover:text-destructive"
            onClick={() => deleteFilter(filterId)}
          >
            <Cross2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove filter</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const BaseFilterItem: FC<{ filter: BaseFilter; className?: string }> = ({
  filter,
  className,
}) => {
  const properties = useDataTableStore(useShallow((state) => state.properties))
  const updateBaseFilterProperty = useDataTableStore(
    (state) => state.updateBaseFilterProperty,
  )
  const updateBaseFilterValue = useDataTableStore(
    (state) => state.updateBaseFilterValue,
  )
  const getPropertySelectOptions = useDataTableStore(
    (state) => state.getPropertySelectOptions,
  )
  const propertyOptions = Object.entries(properties).map(([key, value]) => ({
    key,
    type: value.type,
  }))

  return (
    <div className={cn('flex flex-nowrap items-center gap-1', className)}>
      <PropertySelect
        className="w-[180px]"
        value={filter.property}
        onValueChange={(value) => updateBaseFilterProperty(filter.id, value)}
        properties={propertyOptions}
      />
      <BaseFilterOperatorSelect filter={filter} />

      <BaseFilterValueInput
        filterType={filter.type as ANY}
        filterValueType={
          getFilterValueType(filter.type as ANY, filter.operator)!
        }
        filterOperator={filter.operator}
        value={filter.value}
        selectOptions={getPropertySelectOptions(filter.property)}
        onValueChange={(value) => updateBaseFilterValue(filter.id, value)}
      />
    </div>
  )
}

const BaseFilterOperatorSelect: FC<{ filter: BaseFilter }> = ({ filter }) => {
  const updateFilterOperator = useDataTableStore(
    (state) => state.updateBaseFilterOperator,
  )
  const operatorOptions = useMemo(() => {
    const filterConfig = FILTER_CONFIG[
      filter.type as keyof typeof FILTER_CONFIG
    ] as ANY

    if (!filterConfig?.operators) {
      return []
    }

    return Object.entries(filterConfig.operators).map(([op, conf]) => ({
      key: op,
      label: ((conf as ANY)?.label || op) as string,
    }))
  }, [filter.type])

  return (
    <Select
      value={filter.operator}
      onValueChange={(value) => updateFilterOperator(filter.id, value)}
    >
      <SelectTrigger className="h-7 w-min max-w-28 shrink-0 overflow-hidden p-1 pl-1.5 [&>svg]:shrink-0">
        <SelectValue placeholder="Operator" />
      </SelectTrigger>
      <SelectContent>
        {operatorOptions.map(({ key, label }) => (
          <SelectItem key={key} value={key}>
            <div className="flex max-w-60 flex-nowrap items-center overflow-hidden">
              <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
                {label}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const AddFilterMenu: FC<{ parentId: FilterId; depth: number }> = ({
  parentId,
  depth,
}) => {
  const addBaseFilter = useDataTableStore((state) => state.addBaseFilter)
  const addCompoundFilter = useDataTableStore(
    (state) => state.addCompoundFilter,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-full justify-start px-2 text-muted-foreground"
        >
          <PlusIcon className="mr-2 size-4" />
          Add filter rule
          <CaretDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start">
        <DropdownMenuItem onClick={() => addBaseFilter(parentId)}>
          <PlusIcon className="mr-2 size-4" /> Add filter rule
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={depth >= MAX_FILTER_DEPTH + 1}
          onClick={() => addCompoundFilter(parentId)}
        >
          <span className="flex items-start">
            <LayersIcon className="mt-0.5 mr-2 size-4" />
            <div>
              <div>Add filter group</div>
              <div className="text-muted-foreground text-xs">
                A group to nest more filters
              </div>
            </div>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const NegationSelect: FC = () => {
  return (
    <Select value="no" onValueChange={(value) => console.log(value)}>
      <SelectTrigger className="h-7 w-20 shrink-0 overflow-hidden p-1 pl-1.5 [&>svg]:shrink-0">
        <SelectValue placeholder="Operator" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no">
          <div className="flex flex-nowrap items-center overflow-hidden">
            <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
              Where
            </span>
          </div>
        </SelectItem>
        <SelectItem value="yes" disabled>
          <div className="flex flex-nowrap items-center overflow-hidden">
            <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
              Exclude
            </span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

const CompoundOperatorSelect: FC<{
  value: string
  onValueChange: (value: string) => void
}> = ({ value, onValueChange }) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 w-20 shrink-0 overflow-hidden p-1 pl-1.5 [&>svg]:shrink-0">
        <SelectValue placeholder="Operator" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(COMPOUND_OPERATOR).map((op) => (
          <SelectItem key={op} value={op}>
            <div className="flex flex-nowrap items-center overflow-hidden">
              <span className="flex-1 overflow-hidden overflow-ellipsis text-nowrap text-xs">
                {capitalize(op)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const BaseFilterValueInput: FC<{
  filterType: FilterType
  filterValueType: FilterValueType
  filterOperator: string
  value: BaseFilter['value']
  selectOptions?: { name: string; color?: string }[]
  onValueChange: (value: BaseFilter['value']) => void
}> = ({
  onValueChange,
  value,
  filterValueType,
  filterOperator,
  selectOptions = [],
  filterType,
}) => {
  if (filterValueType === 'text') {
    return (
      <Input
        className="h-7 px-1.5 text-xs"
        value={value.toString()}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={`Enter ${filterValueType}`}
      />
    )
  }

  if (filterValueType === 'number') {
    return (
      <Input
        type="number"
        className="h-7 px-1.5 text-xs"
        value={value.toString()}
        onChange={(e) => onValueChange(+e.target.value)}
        placeholder={`Enter ${filterValueType}`}
      />
    )
  }

  if (filterValueType === 'date') {
    let date: Date | undefined = undefined
    try {
      if (new Date(value as string).toString() !== 'Invalid Date') {
        date = new Date(value as string)
      }
    } catch {
      console.warn('Invalid date', value)
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'h-7 w-auto justify-start text-left font-normal text-xs',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-auto flex-col space-y-2 p-2"
        >
          <Select
            onValueChange={(value) =>
              onValueChange(addDays(new Date(), parseInt(value)).toISOString())
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="0">Today</SelectItem>
              <SelectItem value="1">Tomorrow</SelectItem>
              <SelectItem value="3">In 3 days</SelectItem>
              <SelectItem value="7">In a week</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) =>
                onValueChange(selected ? selected.toISOString() : '')
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (filterValueType === 'select' || filterValueType === 'multi_select') {
    if (selectOptions.length) {
      return (
        <Select value={value as ANY} onValueChange={onValueChange}>
          <SelectTrigger className="h-7 w-auto px-1.5 text-xs">
            <SelectValue placeholder="Select..." className="h-7 text-xs" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map(({ name, color }) => (
              <SelectItem key={name} value={name}>
                <PropertySelectItem name={name} color={color} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    const options: { label: string; value: ANY }[] = get(
      FILTER_CONFIG,
      [filterType, 'operators', filterOperator, 'value', 'options'],
      [],
    )

    return (
      <Select
        disabled={!options.length}
        value={value as ANY}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="h-7 w-auto px-1.5 text-xs">
          <SelectValue placeholder="Select..." className="h-7 text-xs" />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (filterValueType === 'always_be_true') {
    return null
  }

  return <div>Unsupported filter {filterValueType}</div>
}
