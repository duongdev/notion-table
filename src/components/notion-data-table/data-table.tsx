'use client'

import type { DataTableProperty } from '@/lib/notion/types'
import { useDataTableStore } from '@/stores/data-table-provider'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  type Cell,
  type ColumnDef,
  type Header,
  type Table as ReactTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { isEqual } from 'lodash-es'
import {
  type CSSProperties,
  type FC,
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { getTableColumns } from './get-table-columns'
import { PropertyIcon } from './property-icon'
import type { DataTableItem } from './types'

export type DataTableProps = {
  data: DataTableItem[]
}

export const DataTable: FC<DataTableProps> = ({ data }) => {
  const properties = useDataTableStore(useShallow((state) => state.properties))

  const columns = getTableColumns(properties)
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!),
  )

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
    // column ordering
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  })

  // reorder columns after drag & drop
  const handleColumnDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

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

  const dndId = useId()

  return (
    <DndContext
      key={dndId}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleColumnDragEnd}
      sensors={sensors}
    >
      <ScrollArea className="w-full">
        <div className="px-4 sm:px-8 md:px-24">
          <div className="[&>div]:-mr-[1px] overflow-hidden rounded-md border [&>div]:overflow-hidden">
            <Table style={{ ...columnSizeVars, width: table.getTotalSize() }}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <DraggableTableHeader
                            key={header.id}
                            header={header}
                          />
                        )
                      })}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHeader>
              {/* When resizing any column we will render this special memoized version of our table body */}
              <PerformantBody
                table={table}
                columns={columns}
                columnOrder={columnOrder}
              />
            </Table>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DndContext>
  )
}

function PerformantBody({
  table,
  columns,
  columnOrder,
}: {
  table: ReactTable<DataTableItem>
  columns: ColumnDef<DataTableItem>[]
  columnOrder: string[]
}) {
  return table.getState().columnSizingInfo.isResizingColumn ? (
    <MemoizedTBody table={table} columns={columns} columnOrder={columnOrder} />
  ) : (
    <TBody table={table} columns={columns} columnOrder={columnOrder} />
  )
}

const DraggableTableHeader = ({
  header,
}: {
  header: Header<DataTableItem, unknown>
}) => {
  const columnType = useMemo(
    () =>
      (header.column.columnDef.meta as { type: DataTableProperty['type'] })
        ?.type,
    [header.column.columnDef.meta],
  )
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })

  const style: CSSProperties = useMemo(
    () => ({
      opacity: isDragging ? 0.8 : 1,
      position: 'relative',
      transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
      transition: 'width transform 0.2s ease-in-out',
      whiteSpace: 'nowrap',
      width: header.column.getSize(),
      zIndex: isDragging ? 1 : 0,
    }),
    [header.column.getSize, isDragging, transform],
  )

  return (
    <TableHead
      key={header.id}
      className="relative touch-none select-none text-nowrap border-r"
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className="flex items-center"
      >
        {header.isPlaceholder ? null : (
          <>
            <PropertyIcon type={columnType} className="mr-1.5" />
            {flexRender(header.column.columnDef.header, header.getContext())}
          </>
        )}
      </div>
      <ColumnResizer header={header} />
    </TableHead>
  )
}

const DragAlongCell = ({ cell }: { cell: Cell<DataTableItem, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = useMemo(
    () => ({
      opacity: isDragging ? 0.8 : 1,
      position: 'relative',
      transform: CSS.Translate.toString(transform),
      transition: 'width transform 0.2s ease-in-out',
      zIndex: isDragging ? 1 : 0,
    }),
    [isDragging, transform],
  )

  return (
    <TableCell
      key={cell.id}
      style={{
        width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
        ...style,
      }}
      className="border-r"
      ref={setNodeRef}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  )
}

export const ColumnResizer = ({
  header,
}: {
  header: Header<DataTableItem, unknown>
}) => {
  if (header.column.getCanResize() === false) {
    return null
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

function TBody({
  table,
  columns,
  columnOrder,
}: {
  table: ReactTable<DataTableItem>
  columns: ColumnDef<DataTableItem>[]
  columnOrder: string[]
}) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
            {row.getVisibleCells().map((cell) => (
              <SortableContext
                key={cell.id}
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                <DragAlongCell key={cell.id} cell={cell} />
              </SortableContext>
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

// special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTBody = memo(TBody, (prev, next) => {
  return isEqual(prev, next)
}) as typeof TBody
