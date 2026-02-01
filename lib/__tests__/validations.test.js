/**
 * Testes dos schemas Zod em lib/validations.js
 */
import {
  cartItemSchema,
  cartSyncSchema,
  photographerProfileSchema,
  uploadMetadataSchema,
  uploadRequestSchema,
  photoBatchSchema,
  fotografoCreateBodySchema,
  carrinhoItemBodySchema,
  checkoutProcessBodySchema,
} from "@/lib/validations";

describe("lib/validations", () => {
  describe("cartItemSchema", () => {
    it("aceita item com fotoId válido (cuid)", () => {
      const result = cartItemSchema.safeParse({
        fotoId: "clxx1234567890abcdefghij",
      });
      expect(result.success).toBe(true);
    });

    it("aceita item com fotoId UUID", () => {
      const result = cartItemSchema.safeParse({
        fotoId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("aceita item com titulo e preco opcionais", () => {
      const result = cartItemSchema.safeParse({
        fotoId: "clxx1234567890abcdefghij",
        titulo: "Minha Foto",
        preco: 29.9,
        licenca: "pessoal",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita preco negativo", () => {
      const result = cartItemSchema.safeParse({
        fotoId: "clxx1234567890abcdefghij",
        preco: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("cartSyncSchema", () => {
    it("aceita array de itens válidos", () => {
      const result = cartSyncSchema.safeParse({
        items: [{ fotoId: "clxx1234567890abcdefghij" }],
      });
      expect(result.success).toBe(true);
    });

    it("aceita items vazio", () => {
      const result = cartSyncSchema.safeParse({ items: [] });
      expect(result.success).toBe(true);
    });

    it("rejeita se items não for array", () => {
      const result = cartSyncSchema.safeParse({ items: "not-array" });
      expect(result.success).toBe(false);
    });
  });

  describe("photographerProfileSchema", () => {
    it("aceita username válido (3-30 chars, alfanumérico e _-)", () => {
      const result = photographerProfileSchema.safeParse({
        username: "fotografo_123",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita username curto demais", () => {
      const result = photographerProfileSchema.safeParse({
        username: "ab",
      });
      expect(result.success).toBe(false);
    });

    it("rejeita username com caracteres inválidos", () => {
      const result = photographerProfileSchema.safeParse({
        username: "fotógrafo!",
      });
      expect(result.success).toBe(false);
    });

    it("aceita bio, city, state, instagram opcionais", () => {
      const result = photographerProfileSchema.safeParse({
        username: "fotografo_ok",
        bio: "Bio aqui",
        city: "São Paulo",
        state: "SP",
        instagram: "@fotografo",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("uploadMetadataSchema", () => {
    it("aceita titulo obrigatório", () => {
      const result = uploadMetadataSchema.safeParse({
        titulo: "Foto de evento",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita titulo vazio", () => {
      const result = uploadMetadataSchema.safeParse({
        titulo: "",
      });
      expect(result.success).toBe(false);
    });

    it("aceita orientacao enum", () => {
      const result = uploadMetadataSchema.safeParse({
        titulo: "Foto",
        orientacao: "HORIZONTAL",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita orientacao inválida", () => {
      const result = uploadMetadataSchema.safeParse({
        titulo: "Foto",
        orientacao: "INVALID",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("uploadRequestSchema", () => {
    it("aceita filename, contentType e folder opcional", () => {
      const result = uploadRequestSchema.safeParse({
        filename: "foto.jpg",
        contentType: "image/jpeg",
      });
      expect(result.success).toBe(true);
    });

    it("aceita content-type webp e avif", () => {
      expect(
        uploadRequestSchema.safeParse({
          filename: "a.webp",
          contentType: "image/webp",
        }).success
      ).toBe(true);
      expect(
        uploadRequestSchema.safeParse({
          filename: "a.avif",
          contentType: "image/avif",
        }).success
      ).toBe(true);
    });

    it("rejeita content-type inválido", () => {
      const result = uploadRequestSchema.safeParse({
        filename: "foto.pdf",
        contentType: "application/pdf",
      });
      expect(result.success).toBe(false);
    });

    it("rejeita folder com caracteres inválidos", () => {
      const result = uploadRequestSchema.safeParse({
        filename: "foto.jpg",
        contentType: "image/jpeg",
        folder: "pasta com espaços!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("photoBatchSchema", () => {
    it("aceita fotografoId e fotos opcional", () => {
      const result = photoBatchSchema.safeParse({
        fotografoId: "fotografo-123",
      });
      expect(result.success).toBe(true);
    });

    it("aceita fotos array com objetos mínimos", () => {
      const result = photoBatchSchema.safeParse({
        fotografoId: "fotografo-123",
        fotos: [{ titulo: "Foto 1" }],
      });
      expect(result.success).toBe(true);
    });

    it("aceita licencas com preco string ou number", () => {
      const result = photoBatchSchema.safeParse({
        fotografoId: "fotografo-123",
        fotos: [
          {
            titulo: "Foto",
            licencas: [
              { licencaId: "lic-1", preco: 10 },
              { licencaId: "lic-2", preco: "19.90" },
            ],
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejeita fotografoId vazio", () => {
      const result = photoBatchSchema.safeParse({
        fotografoId: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fotografoCreateBodySchema", () => {
    it("aceita body mínimo (cidade, estado, chavePix)", () => {
      const result = fotografoCreateBodySchema.safeParse({
        cidade: "São Paulo",
        estado: "SP",
        chavePix: "email@exemplo.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita cidade vazia", () => {
      const result = fotografoCreateBodySchema.safeParse({
        cidade: "",
        estado: "SP",
        chavePix: "chave",
      });
      expect(result.success).toBe(false);
    });

    it("rejeita chavePix vazia", () => {
      const result = fotografoCreateBodySchema.safeParse({
        cidade: "São Paulo",
        estado: "SP",
        chavePix: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("carrinhoItemBodySchema", () => {
    it("aceita fotoId válido", () => {
      const result = carrinhoItemBodySchema.safeParse({
        fotoId: "clxx1234567890abcdefghij",
      });
      expect(result.success).toBe(true);
    });

    it("rejeita fotoId vazio", () => {
      const result = carrinhoItemBodySchema.safeParse({ fotoId: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("checkoutProcessBodySchema", () => {
    it("aceita body vazio", () => {
      const result = checkoutProcessBodySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("aceita orderId opcional", () => {
      const result = checkoutProcessBodySchema.safeParse({
        orderId: "ord-123",
      });
      expect(result.success).toBe(true);
    });
  });
});
