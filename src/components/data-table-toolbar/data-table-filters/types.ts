import type {
  COMPOUND_OPERATOR,
  FILTER_CONFIG,
  VALUE_TYPE,
} from './filter-config'

export type FilterId = string
export type CompoundOperator = keyof typeof COMPOUND_OPERATOR
export type FilterType = keyof typeof FILTER_CONFIG
export type FilterValueType = keyof typeof VALUE_TYPE

export type FilterTypeOperator<T extends FilterType> =
  (typeof FILTER_CONFIG)[T] extends {
    operators: infer O
  }
    ? keyof O
    : never

type NestedFilter = {
  id: FilterId
  parentId: FilterId | null
  depth: number
}

export type BaseFilter = {
  property: string
  type: string
  operator: string
  value: string | number | boolean | Date
} & NestedFilter

export type CompoundFilter = {
  operator: CompoundOperator
  isNegated: boolean
} & NestedFilter

export type Filter = BaseFilter | CompoundFilter
