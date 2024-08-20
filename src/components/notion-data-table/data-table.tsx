'use client'

import type { DataTableProperties, DataTableProperty } from '@/lib/notion/types'
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
  CalendarIcon,
  CheckboxIcon,
  FrameIcon,
  LetterCaseCapitalizeIcon,
  ListBulletIcon,
  TextAlignLeftIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons'
import {
  type Cell,
  type ColumnDef,
  type Header,
  type Table as ReactTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  type CSSProperties,
  type FC,
  memo,
  useId,
  useMemo,
  useState,
} from 'react'
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
        id: properties[key].id,
        header: key,
        cell: ({ row: { original } }) => {
          return <DataTableCell property={original[key]} />
        },
        meta: { type: properties[key].type },
      }) as ColumnDef<DataTableItem>,
  )
}

export const DataTable: FC<DataTableProps> = ({ data }) => {
  const properties = useDataTableStore((state) => state.properties)

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
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

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
      onDragEnd={handleDragEnd}
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
              <FastBody
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

function FastBody({
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
  const columnType = (
    header.column.columnDef.meta as { type: DataTableProperty['type'] }
  )?.type
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  const HeaderIcon = useMemo(() => {
    switch (columnType) {
      case 'title':
        return LetterCaseCapitalizeIcon
      case 'number':
        return FrameIcon
      case 'checkbox':
        return CheckboxIcon
      case 'rich_text':
        return TextAlignLeftIcon
      case 'select':
        return TriangleDownIcon
      case 'multi_select':
        return ListBulletIcon
      case 'date':
        return CalendarIcon
      default:
        return null
    }
  }, [columnType])

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
            {HeaderIcon && <HeaderIcon className="mr-1.5" />}
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

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    // width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

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

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTBody = memo(TBody, (prev, next) => {
  return prev.table.options.data === next.table.options.data
}) as typeof TBody
