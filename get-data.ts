import { getNotionClients } from './src/lib/notion'

async function main() {
  console.log('Fetching data from Notion...')
  try {
    const clients = await getNotionClients()
    console.log(`Found ${clients.length} clients in Notion:`)
    console.log(JSON.stringify(clients, null, 2))
  } catch (err) {
    console.error('Error fetching from Notion:', err)
  }
}

main()
