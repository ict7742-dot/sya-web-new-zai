import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma log level is env-driven so production isn't drowned in query logs.
//
// - In dev: log query, warn, error — useful while iterating.
// - In prod: log warn + error only. `query` would emit one console line per
//   SQL statement, which on a serverless deployment quickly overwhelms the
//   log stream (and runs up Vercel/Logflare ingest costs).
//
// Override locally with PRISMA_LOG=warn,error or PRISMA_LOG=query.
const defaultLog: Array<'query' | 'warn' | 'error'> =
  process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'warn', 'error'];

const logLevel = (process.env.PRISMA_LOG?.split(',').filter(Boolean) as
  | Array<'query' | 'warn' | 'error'>
  | undefined) ?? defaultLog;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevel,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
