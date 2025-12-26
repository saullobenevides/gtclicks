import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Neon Serverless with connection pooling
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
  
  console.log('✅ Prisma initialized with Neon Serverless adapter');
} else {
  // Development: Use standard Prisma with connection reuse
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.prisma;
  
  console.log('✅ Prisma initialized in development mode');
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
