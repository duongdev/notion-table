import type { ANY } from '@/types'
import { FILTER_CONFIG } from './filter-config'
import type {
  BaseFilter,
  CompoundFilter,
  Filter,
  FilterType,
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

function getNegatedOperator(filterType: FilterType, operator: string) {
  return (
    ((FILTER_CONFIG[filterType] as ANY).operators[operator]
      .negation as string) || null
  )
}

function getNegatedCompoundOperator(operator: 'and' | 'or') {
  return operator === 'and' ? 'or' : 'and'
}

export function buildNotionFilter(
  filters: Record<string, Filter>,
  parentId: string | null = null,
  isNegated = false,
): ANY {
  const childFilters = Object.values(filters).filter(
    (filter) => filter.parentId === parentId,
  )

  try {
    const childLevels = childFilters.map((filter) => {
      if (isBaseFilter(filter)) {
        const operator = isNegated
          ? getNegatedOperator(filter.type as FilterType, filter.operator)
          : filter.operator

        if (!operator) {
          throw new Error(
            `Operator negation not found for filter type: ${filter.type} and operator: ${filter.operator}`,
          )
        }

        return {
          property: filter.property,
          [filter.type]: {
            [operator]: filter.value,
          },
        }
      }

      const compoundFilter = filter as CompoundFilter
      const compoundOperator = isNegated
        ? getNegatedCompoundOperator(compoundFilter.operator)
        : compoundFilter.operator

      return {
        [compoundOperator]: buildNotionFilter(
          filters,
          compoundFilter.id,
          !parentId
            ? compoundFilter.isNegated
            : isNegated
              ? !compoundFilter.isNegated
              : compoundFilter.isNegated,
        ),
      }
    })

    if (!parentId) {
      return childLevels[0]
    }

    return childLevels
  } catch (error) {
    if (!parentId) {
      return { error: (error as Error).message }
    }
    throw error
  }
}
