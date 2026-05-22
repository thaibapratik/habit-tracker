import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const ds_id = "361c745a-65de-80f3-92b4-000b8bd1729f"

async function main() {
  try {
    const ds = await notion.dataSources.retrieve({ data_source_id: ds_id })
    console.log("DS props:", Object.keys((ds as any).properties))
    const response = await notion.dataSources.query({
      data_source_id: ds_id,
    })
    console.log(`Found ${response.results.length} results:`)
    console.log(JSON.stringify(response.results, null, 2))
  } catch (e) {
    console.error("ERROR:", e)
  }
}
main()
