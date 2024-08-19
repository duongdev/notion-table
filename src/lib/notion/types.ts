import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export type DataTableItems = PageObjectResponse
export type DataTableProperties = PageObjectResponse['properties']
export type DataTableProperty = PageObjectResponse['properties'][string]
