import { getPhotoById } from './lib/data/marketplace.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    // 1. Find a real photo ID from the DB
    const realPhoto = await prisma.foto.findFirst();
    if (realPhoto) {
        console.log("Found a real photo in DB with ID:", realPhoto.id);
        console.log("Testing getPhotoById with REAL ID...");
        const result = await getPhotoById(realPhoto.id);
        console.log("Result (Real ID):", JSON.stringify(result, null, 2));
    } else {
        console.log("No photos found in DB.");
    }
    
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