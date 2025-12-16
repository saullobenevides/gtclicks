import prisma from "./lib/prisma.js";
import fs from "fs";

async function main() {
  const logStream = fs.createWriteStream("debug_output.txt");
  const log = (msg) => {
      console.log(msg);
      logStream.write(msg + "\n");
  };

  log("Fetching collections...");
  const collections = await prisma.colecao.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      fotos: {
        take: 1
      },
      fotografo: {
        include: { user: true }
      }
    }
  });

  log(`Found collections: ${collections.length}`);

  for (const c of collections) {
    log("------------------------------------------------");
    log(`Collection: ${c.nome} (ID: ${c.id})`);
    log(`Slug: ${c.slug}`);
    log(`CapaUrl: ${c.capaUrl ? c.capaUrl : "NULL"}`);
    
    if (c.fotos.length > 0) {
      log(`Photos Found: ${c.fotos.length}`);
      log(`First Photo PreviewUrl: ${c.fotos[0].previewUrl}`);
      log(`Computed Cover: ${c.capaUrl || c.fotos[0].previewUrl}`);
    } else {
      log("No photos in collection.");
      log(`Computed Cover: ${c.capaUrl || "Gradient Fallback"}`);
    }
  }
  logStream.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


