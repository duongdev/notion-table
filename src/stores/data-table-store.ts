import { queryNotionDatabase } from '@/lib/notion/client'
import { getNotionProperties } from '@/lib/notion/helpers'
import type { DataTableItems, DataTableProperties } from '@/lib/notion/types'
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
}

export interface DataTableActions {
  fetchNotionData: () => Promise<void>
  setSorts: (sorts: DataTableState['sorts']) => void
}

export type DataTableStore = DataTableState & DataTableActions

export const defaultInitialDataTableState: DataTableState = {
  isLoaded: false,
  isFetching: false,
  entities: [],
  properties: {},
  sorts: [],
}

export const createDataTableStore = (entities: DataTableItems[]) => {
  const store = createStore<DataTableStore>()((set, get) => ({
    ...defaultInitialDataTableState,
    entities,
    properties: getNotionProperties(entities),
    isLoaded: true,

    fetchNotionData: async () => {
      set((state) => ({ ...state, isFetching: true }))

      try {
        const entities = await queryNotionDatabase({ sorts: get().sorts })

        set((state) => ({
          ...state,
          entities,
          properties: getNotionProperties(entities),
          isFetching: false,
        }))
      } catch (error) {
        console.error('🚀 ~ fetchNotionData: ~ error:', error)
        set((state) => ({ ...state, isFetching: false }))
      }
    },
    setSorts: (sorts) => set((state) => ({ ...state, sorts })),
  }))
  return store
}
