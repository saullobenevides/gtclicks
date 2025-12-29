import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

let prisma;

  // Development or Production (Standard Mode for Stability)
  // We are temporarily disabling the Neon Adapter specific logic to resolve Vercel build issues 
  // related to sitemap generation and the serverless driver.
  // Standard Prisma Client works well with Neon too.
  
  const globalForPrisma = globalThis;
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = globalForPrisma.prisma;
  
  console.log('✅ Prisma initialized in standard mode (Adapter Disabled)');
//}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
