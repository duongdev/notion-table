import { getNotionProperties } from '@/lib/notion/helpers'
import type { DataTableItems, DataTableProperties } from '@/lib/notion/types'
import { createStore } from 'zustand/vanilla'

export interface DataTableState {
  isLoaded: boolean
  entities: DataTableItems[]
  properties: DataTableProperties
}

export interface DataTableActions {}

export type DataTableStore = DataTableState & DataTableActions

export const defaultInitialDataTableState: DataTableState = {
  isLoaded: false,
  entities: [],
  properties: {},
}

export const createDataTableStore = (entities: DataTableItems[]) => {
  const store = createStore<DataTableState>()((_set) => ({
    ...defaultInitialDataTableState,
    entities,
    properties: getNotionProperties(entities),
    isLoaded: true,
  }))
  return store
}
