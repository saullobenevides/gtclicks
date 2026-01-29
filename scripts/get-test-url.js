import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const foto = await prisma.foto.findFirst({
    where: {
      s3Key: {
        contains: "originals",
      },
    },
    select: {
      s3Key: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (foto) {
    const bucket = process.env.S3_UPLOAD_BUCKET;
    const region = process.env.S3_UPLOAD_REGION;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${foto.s3Key}`;
    console.log(`TEST_URL: ${url}`);
  } else {
    console.log("No photos in original folder found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
