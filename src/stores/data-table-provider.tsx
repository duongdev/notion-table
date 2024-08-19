'use client'

import { type ReactNode, createContext, useContext, useRef } from 'react'
import { type StoreApi, useStore } from 'zustand'
import {
  type DataTableStore,
  createDataTableStore,
  initDataTableStore,
} from './data-table-store'

export const DataTableStoreContext =
  createContext<StoreApi<DataTableStore> | null>(null)

export type DataTableStoreProviderProps = {
  children: ReactNode
}

export const DataTableStoreProvider = ({
  children,
}: DataTableStoreProviderProps) => {
  const storeRef = useRef<StoreApi<DataTableStore>>()

  if (!storeRef.current) {
    storeRef.current = createDataTableStore(initDataTableStore())
  }

  return (
    <DataTableStoreContext.Provider value={storeRef.current}>
      {children}
    </DataTableStoreContext.Provider>
  )
}

export function useDataTableStore<T>(
  selector: (store: DataTableStore) => T,
): T {
  const store = useContext(DataTableStoreContext)

  if (!store) {
    throw new Error(
      `useDataTableStore must be used within DataTableStoreProvider`,
    )
  }

  return useStore(store, selector)
}
