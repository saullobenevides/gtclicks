
import { getPhotoById } from './lib/data/marketplace.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing getPhotoById with FAKE ID...");
    const resultFake = await getPhotoById("non-existent-id-123");
    console.log("Result (Fake ID):", JSON.stringify(resultFake, null, 2));

  } catch (error) {
    console.error("CRASH:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
