import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

let prisma;

if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  // Production on Vercel: Use Neon Serverless with connection pooling
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Debug logging
  console.log('DEBUG: connectionString type:', typeof connectionString);
  console.log('DEBUG: connectionString length:', connectionString.length);
  // Mask generic connection string
  console.log('DEBUG: connectionString preview:', connectionString.substring(0, 15) + '...');
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
  
  console.log('✅ Prisma initialized with Neon Serverless adapter (Vercel)');
} else {
  // Development or Local Production Build: Use standard Prisma
  const globalForPrisma = globalThis;
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = globalForPrisma.prisma;
  
  console.log('✅ Prisma initialized in standard mode');
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
