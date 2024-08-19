'use server'

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Client } from '@notionhq/client'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import type { DataTableItems } from './types'

const NOTION_SECRET = process.env.NOTION_SECRET!
const NOTION_DB_ID = process.env.NOTION_DB_ID!

const notionClient = new Client({
  auth: NOTION_SECRET,
})

export async function queryNotionDatabase(
  variables?: QueryDatabaseParameters,
): Promise<DataTableItems[]> {
  const query = await notionClient.databases.query({
    ...variables,
    database_id: NOTION_DB_ID,
  })

  if (process.env.NODE_ENV === 'development') {
    // Dump the data to a file for easier development only if the file changed
    // or doesn't exist to prevent hot reloading issues
    if (
      !existsSync('src/lib/notion/data.json') ||
      JSON.stringify(query.results, null, 2) !==
        readFileSync('src/lib/notion/data.json', 'utf-8')
    ) {
      writeFileSync(
        'src/lib/notion/data.json',
        JSON.stringify(query.results, null, 2),
      )
    }
  }

  return query.results as DataTableItems[]
}
