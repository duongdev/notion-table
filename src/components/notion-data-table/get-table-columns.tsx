import type { DataTableProperties } from '@/lib/notion/types'
import type { ColumnDef } from '@tanstack/react-table'
import { MemoizedDataTableCell } from './data-table-cell'
import type { DataTableItem } from './types'

export function getTableColumns(
  properties: DataTableProperties,
): ColumnDef<DataTableItem>[] {
  // property.type === 'title' always goes first
  const titleProperty = Object.entries(properties).find(
    ([, property]) => property.type === 'title',
  )!
  const propertiesWithoutTitle = Object.fromEntries(
    Object.entries(properties).filter(([key]) => key !== titleProperty?.[0]),
  )

  return [titleProperty[0], ...Object.keys(propertiesWithoutTitle)].map(
    (key) =>
      ({
        id: properties[key].id,
        header: key,
        cell: ({ row: { original } }) => {
          return <MemoizedDataTableCell property={original[key]} />
        },
        meta: { type: properties[key].type },
      }) as ColumnDef<DataTableItem>,
  )
}
