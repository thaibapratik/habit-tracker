import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Fetching data from Prisma...')
  try {
    const clients = await prisma.client.findMany()
    console.log(`Found ${clients.length} clients in Prisma DB:`)
    console.log(JSON.stringify(clients, null, 2))
  } catch (err: any) {
    console.error('Error fetching from Prisma:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
