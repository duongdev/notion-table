import type { DataTableItems, DataTableProperties } from './types'

export function getNotionProperties(
  items: DataTableItems[],
): DataTableProperties {
  const mostPropertiesItem = items.reduce((acc, item) => {
    return Object.keys(item.properties).length >
      Object.keys(acc.properties).length
      ? item
      : acc
  }, items[0])

  return mostPropertiesItem.properties
}
