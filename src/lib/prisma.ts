import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Use Transaction pooler (port 6543) which was reachable, with pgbouncer=true to fix prepared statements
    const databaseUrl = process.env.DATABASE_URL ||
        "postgresql://postgres.qohndwgsievfluieykgi:Codelyoko1993..@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

    return new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl
            }
        }
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
