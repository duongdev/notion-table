'use client'

import type { DataTableProperties } from '@/lib/notion/types'
import { useDataTableStore } from '@/stores/data-table-provider'
import {
  type ColumnDef,
  type Header,
  type Table as ReactTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type FC, memo, useMemo } from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { DataTableCell } from './data-table-cell'
import type { DataTableItem } from './types'

export type DataTableProps = {
  data: DataTableItem[]
}

function getTableColumns(
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
        header: key,
        cell: ({ row: { original } }) => {
          return <DataTableCell property={original[key]} />
        },
      }) as ColumnDef<DataTableItem>,
  )
}

export const DataTable: FC<DataTableProps> = ({ data }) => {
  const properties = useDataTableStore((state) => state.properties)

  const columns = getTableColumns(properties)

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 200, //starting column size
      minSize: 50, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
    // column sizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  return (
    <ScrollArea className="w-full">
      <div className="px-4 sm:px-8 md:px-24">
        <Table
          style={{ ...columnSizeVars, width: table.getTotalSize() }}
          className="border"
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="relative text-nowrap border-r"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                      <ColumnResizer header={header} />
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* When resizing any column we will render this special memoized version of our table body */}
          {table.getState().columnSizingInfo.isResizingColumn ? (
            <MemoizedTBody table={table} columns={columns} />
          ) : (
            <TBody table={table} columns={columns} />
          )}
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export const ColumnResizer = ({
  header,
}: {
  header: Header<DataTableItem, unknown>
}) => {
  if (header.column.getCanResize() === false) {
    return <></>
  }

  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() => header.column.resetSize()}
      className="-right-1 active:-right-[2px] absolute top-0 z-10 h-full w-2 cursor-col-resize transition-all hover:w-2 hover:bg-gray-500 active:w-1 active:bg-gray-600"
      style={{
        userSelect: 'none',
        touchAction: 'none',
      }}
    />
  )
}

//un-memoized normal table body component - see memoized version below
function TBody({
  table,
  columns,
}: { table: ReactTable<DataTableItem>; columns: ColumnDef<DataTableItem>[] }) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                style={{
                  width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                }}
                className="border-r"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTBody = memo(TBody, (prev, next) => {
  return prev.table.options.data === next.table.options.data
}) as typeof TBody
