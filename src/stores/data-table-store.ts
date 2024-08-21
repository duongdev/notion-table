import type { FILTER_CONFIG } from '@/components/data-table-toolbar/data-table-filters/filter-config'
import {
  buildNotionFilter,
  getDefaultOperator,
  getFilterValueType,
  isPropertyTypeSupported,
} from '@/components/data-table-toolbar/data-table-filters/helpers'
import type {
  BaseFilter,
  CompoundFilter,
  Filter,
  FilterId,
  FilterType,
} from '@/components/data-table-toolbar/data-table-filters/types'
import { queryNotionDatabase } from '@/lib/notion/client'
import { getNotionProperties } from '@/lib/notion/helpers'
import type { DataTableItems, DataTableProperties } from '@/lib/notion/types'
import { getId } from '@/lib/utils'
import type { ANY } from '@/types'
import { uniqBy } from 'lodash-es'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

export interface DataTableState {
  isLoaded: boolean
  isFetching: boolean
  entities: DataTableItems[]
  properties: DataTableProperties
  sorts: {
    property: string
    direction: 'ascending' | 'descending'
  }[]
  filters: Record<string, Filter>
}

export interface DataTableActions {
  fetchNotionData: () => Promise<void>

  setSorts: (sorts: DataTableState['sorts']) => void

  addBaseFilter: (parentId: FilterId) => void
  updateBaseFilterProperty: (filterId: string, propertyName: string) => void
  updateBaseFilterOperator: (filterId: string, operator: string) => void
  updateBaseFilterValue: (filterId: string, value: ANY) => void
  getPropertySelectOptions: (
    propertyName: string,
  ) => { name: string; color?: string }[]
  updateCompoundFilterOperator: (filterId: string, operator: string) => void
  addCompoundFilter: (parentId: FilterId) => void
  deleteFilter: (filterId: FilterId) => void
  clearFilters: () => void

  _cacheAllPropertyOptions: () => void
}

export type DataTableStore = DataTableState & DataTableActions

export const defaultInitialDataTableState: DataTableState = {
  isLoaded: false,
  isFetching: false,
  entities: [],
  properties: {},
  sorts: [],
  filters: {
    root: {
      operator: 'and',
      isNegated: false,
      id: 'root',
      parentId: null,
      depth: 0,
    },
  },
}

export const createDataTableStore = (entities: DataTableItems[]) => {
  const store = createStore<DataTableStore>()(
    immer((set, get) => ({
      ...defaultInitialDataTableState,
      entities,
      properties: getNotionProperties(entities),
      isLoaded: true,

      fetchNotionData: async () => {
        set((state) => ({ ...state, isFetching: true }))

        try {
          const entities = await queryNotionDatabase({
            sorts: get().sorts,
            filter: buildNotionFilter(get().filters),
          })

          set((state) => ({
            ...state,
            entities,
            properties: getNotionProperties(entities),
            isFetching: false,
          }))

          // Cache all property options
          get()._cacheAllPropertyOptions()
        } catch (error) {
          console.error('🚀 ~ fetchNotionData: ~ error:', error)
          set((state) => ({ ...state, isFetching: false }))
        }
      },

      setSorts: (sorts) => set((state) => ({ ...state, sorts })),

      addBaseFilter: (parentId) => {
        const firstProperty = Object.entries(get().properties)[0]
        const [property] = firstProperty
        const type = firstProperty[1].type as keyof typeof FILTER_CONFIG
        const parentFilter = get().filters[parentId]

        const filter: BaseFilter = {
          id: getId(),
          parentId,
          property,
          type,
          operator: getDefaultOperator(type),
          value: '',
          depth: parentFilter ? parentFilter.depth + 1 : 0,
        }

        set((state) => {
          state.filters[filter.id] = filter
        })
      },

      updateBaseFilterProperty: (filterId, propertyName) => {
        const filter = get().filters[filterId] as BaseFilter
        const propertyType = get().properties[propertyName].type

        if (!(filter && isPropertyTypeSupported(propertyType))) {
          return
        }

        return set((state) => {
          state.filters[filterId] = {
            ...filter,
            property: propertyName,
            type: propertyType,
            operator: getDefaultOperator(propertyType as FilterType),
            value: '',
          }
        })
      },

      updateBaseFilterOperator: (filterId, operator) => {
        const filter = get().filters[filterId] as BaseFilter

        if (!filter) {
          return
        }

        const oldValueType = getFilterValueType(
          filter.type as keyof typeof FILTER_CONFIG,
          filter.operator,
        )
        const newValueType = getFilterValueType(
          filter.type as keyof typeof FILTER_CONFIG,
          operator,
        )

        set((state) => {
          state.filters[filterId] = {
            ...filter,
            operator,
            value:
              newValueType === 'always_be_true'
                ? true
                : oldValueType === newValueType
                  ? filter.value
                  : '',
          }
        })
      },

      updateBaseFilterValue: (filterId, value) => {
        const filter = get().filters[filterId] as BaseFilter

        if (!filter) {
          return
        }

        set((state) => {
          state.filters[filterId] = { ...filter, value }
        })
      },

      getPropertySelectOptions: (propertyName) => {
        const entities = get().entities
        const properties = get().properties
        const property = properties[propertyName]

        if (!property) {
          return []
        }

        const cachedOptions =
          typeof window !== 'undefined' &&
          window.localStorage.getItem(`${propertyName}-options`)
            ? JSON.parse(
                window.localStorage.getItem(
                  `${propertyName}-options`,
                ) as string,
              )
            : []

        const options: { name: string; color?: string }[] = cachedOptions

        entities.forEach((entity) => {
          const entityProperty = entity.properties[propertyName]

          if (!(entityProperty && entityProperty.type === property.type)) {
            return
          }

          if (entityProperty.type === 'select' && entityProperty.select) {
            options.push({
              name: entityProperty.select.name,
              color: entityProperty.select.color,
            })
          } else if (
            entityProperty.type === 'multi_select' &&
            entityProperty.multi_select
          ) {
            entityProperty.multi_select.forEach((option) => {
              options.push({
                name: option.name,
                color: option.color,
              })
            })
          }
        })

        const uniqOptions = uniqBy(options, 'name')

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            `${propertyName}-options`,
            JSON.stringify(uniqOptions),
          )
        }

        return uniqOptions
      },

      updateCompoundFilterOperator: (filterId, operator) => {
        const filter = get().filters[filterId] as Filter

        if (!filter) {
          return
        }

        set((state) => {
          state.filters[filterId].operator = operator
        })
      },

      addCompoundFilter: (parentId) => {
        const parentFilter = get().filters[parentId]

        const filter: CompoundFilter = {
          id: getId(),
          parentId,
          operator: 'and',
          isNegated: false,
          depth: parentFilter ? parentFilter.depth + 1 : 0,
        }

        set((state) => {
          state.filters[filter.id] = filter
        })

        // create first base filter
        get().addBaseFilter(filter.id)
      },

      deleteFilter: (filterId) => {
        // Recursively delete all nested filters
        const filter = get().filters[filterId]

        if (!filter || filterId === 'root') {
          return
        }

        const childFilters = Object.values(get().filters).filter(
          (f) => f.parentId === filterId,
        )

        childFilters.forEach((childFilter) => {
          get().deleteFilter(childFilter.id)
        })

        set((state) => {
          delete state.filters[filterId]
        })
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {
            root: {
              operator: 'and',
              isNegated: false,
              id: 'root',
              parentId: null,
              depth: 0,
            },
          }
        })
      },

      // biome-ignore lint/style/useNamingConvention: <explanation>
      _cacheAllPropertyOptions: () => {
        try {
          const properties = get()?.properties ?? {}

          Object.keys(properties).forEach((propertyName) => {
            get().getPropertySelectOptions(propertyName)
          })
        } catch (error) {
          console.error('🚀 ~ _cacheAllPropertyOptions: ~ error:', error)
        }
      },
    })),
  )
  return store
}
