import { z } from "zod";

export const cartItemSchema = z.object({
  fotoId: z.string().cuid2().or(z.string().uuid()).or(z.string()),
  titulo: z.string().optional(),
  preco: z.number().nonnegative().optional(),
  licenca: z.string().optional(),
  licencaId: z.string().optional(),
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
      "Username must contain only letters, numbers, underscores, and dashes"
    ),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  instagram: z.string().max(50).optional(),
});

export const fotografoCreateBodySchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().max(255).optional(),
  username: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  telefone: z.string().max(30).optional(),
  cidade: z.string().min(1, "Cidade é obrigatória").max(100),
  estado: z.string().min(1, "Estado é obrigatório").max(50),
  instagram: z.string().max(100).optional(),
  chavePix: z.string().max(255).optional(), // Cadastrar na página Financeiro com 2FA
});

export const fotografoOnboardingBodySchema = z.object({
  cidade: z.string().max(100).optional(),
  estado: z.string().max(50).optional(),
  instagram: z.string().max(100).optional(),
  portfolioUrl: z.string().url().max(500).optional().or(z.literal("")),
  bio: z.string().max(1000).optional(),
  especialidades: z.array(z.string()).optional(),
  equipamentos: z.string().max(500).optional(),
  cpf: z.string().min(11, "CPF inválido").max(14),
});

export const carrinhoItemBodySchema = z.object({
  fotoId: z.string().min(1, "Foto ID é obrigatório"),
});

export const checkoutProcessBodySchema = z.object({
  orderId: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
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
  fotografoId: z.string().min(1, "fotografoId é obrigatório"),
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
        colecaoId: z.string().optional(),
        numeroSequencial: z.number().optional(),
        dataCaptura: z.string().optional(),
        camera: z.string().optional(),
        lens: z.string().optional(),
        iso: z.number().optional(),
        shutterSpeed: z.string().optional(),
        aperture: z.string().optional(),
        tags: z.array(z.string()).optional(),
        licencas: z
          .array(
            z.object({
              licencaId: z.string(),
              preco: z.union([z.string(), z.number()]),
            })
          )
          .optional(),
      })
    )
    .optional(),
});
