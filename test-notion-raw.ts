import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const rawDbId = process.env.NOTION_DATABASE_ID || ''
const DATABASE_ID = rawDbId.split('?')[0]

async function main() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
    })
    console.log("Response:", JSON.stringify(response, null, 2))
  } catch (e) {
    console.error("ERROR:", e)
  }
}
main()
