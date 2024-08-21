import type { ANY } from '@/types'
import { FILTER_CONFIG } from './filter-config'
import type {
  BaseFilter,
  CompoundFilter,
  Filter,
  FilterValueType,
} from './types'

export function getDefaultOperator(type: keyof typeof FILTER_CONFIG) {
  return (FILTER_CONFIG[type] as ANY).default_operator as string
}

export function isPropertyTypeSupported(type: string) {
  return Object.keys(FILTER_CONFIG).includes(type)
}

export function getFilterValueType(
  type: keyof typeof FILTER_CONFIG,
  operator: string,
) {
  return (FILTER_CONFIG[type] as ANY)?.operators?.[operator]?.value?.type as
    | FilterValueType
    | undefined
}

export function isBaseFilter(filter: Filter): filter is BaseFilter {
  return 'property' in filter
}

export function isCompoundFilter(filter: Filter): filter is CompoundFilter {
  return !isBaseFilter(filter)
}

export function buildNotionFilter(
  filters: Record<string, Filter>,
  parentId: string | null = null,
): ANY {
  const childFilters = Object.values(filters).filter(
    (filter) => filter.parentId === parentId,
  )

  const childLevels = childFilters.map((filter) => {
    if (isBaseFilter(filter)) {
      return {
        property: filter.property,
        [filter.type]: {
          [filter.operator]: filter.value,
        },
      }
    }

    const compoundFilter = filter as CompoundFilter

    return {
      [compoundFilter.operator]: buildNotionFilter(filters, compoundFilter.id),
    }
  })

  if (!parentId) {
    return childLevels[0]
  }

  return childLevels
}
