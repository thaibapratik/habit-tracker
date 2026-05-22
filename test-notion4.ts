import { Client } from '@notionhq/client'
const notion = new Client({ auth: 'test' })
console.log('databases:', Object.keys(notion.databases))
console.log('pages:', Object.keys(notion.pages))
console.log('dataSources:', Object.keys(notion.dataSources))
