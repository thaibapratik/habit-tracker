import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'test',
})

console.log(Object.keys(notion))
