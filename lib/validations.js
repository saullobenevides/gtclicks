import { z } from "zod";

export const cartItemSchema = z.object({
  fotoId: z.string().cuid2().or(z.string().uuid()).or(z.string()), // Flexible ID validation
  titulo: z.string().optional(),
  preco: z.number().nonnegative().optional(),
  licenca: z.string().optional(),
});

export const cartSyncSchema = z.object({
  items: z.array(cartItemSchema),
});

export const photographerProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-z0-9_-]+$/i,
      "Username must contain only letters, numbers, underscores, and dashes",
    ),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  instagram: z.string().max(50).optional(),
});

export const uploadMetadataSchema = z.object({
  titulo: z.string().min(1, "Title is required").max(100),
  descricao: z.string().max(500).optional(),
  orientacao: z
    .enum(["HORIZONTAL", "VERTICAL", "QUADRADO", "PANORAMICA"])
    .optional(),
});

export const uploadRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|avif)$/, "Invalid image type"),
  folder: z
    .string()
    .regex(/^[a-z0-9-_/]+$/i, "Invalid folder name")
    .optional(),
});

export const photoBatchSchema = z.object({
  fotografoId: z.string().min(1),
  deletedPhotoIds: z.array(z.string()).optional(),
  fotos: z
    .array(
      z.object({
        id: z.string().optional(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        orientacao: z.string().optional(),
        folderId: z.string().nullable().optional(),
        s3Key: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        licencas: z
          .array(
            z.object({
              licencaId: z.string(),
              preco: z.union([z.string(), z.number()]),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});
