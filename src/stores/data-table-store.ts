import { queryNotionDatabase } from '@/lib/notion/client'
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

export async function initDataTableStore(): Promise<DataTableState> {
  try {
    const entities = await queryNotionDatabase()
    const properties = getNotionProperties(entities)

    return {
      isLoaded: true,
      entities,
      properties,
    }
  } catch (error) {
    console.error('Failed to initialize DataTableStore:', error)
    return defaultInitialDataTableState
  }
}

export const createDataTableStore = (initState: Promise<DataTableState>) => {
  const store = createStore<DataTableState>()((_set) => ({
    ...defaultInitialDataTableState,
  }))
  initState.then((state) => store.setState(state))
  return store
}
