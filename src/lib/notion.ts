'use server'

import { Client } from '@notionhq/client'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'

const NOTION_SECRET = process.env.NOTION_SECRET!
const NOTION_DB_ID = process.env.NOTION_DB_ID!

const notionClient = new Client({
  auth: NOTION_SECRET,
})

export async function queryNotionDatabase(variables?: QueryDatabaseParameters) {
  const query = await notionClient.databases.query({
    ...variables,
    database_id: NOTION_DB_ID,
  })

  return query.results
}
