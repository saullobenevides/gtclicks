import {
  createCollection,
  updateCollection,
  getCollections,
} from "@/actions/collections";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// Mocks
jest.mock("@/lib/prisma", () => ({
  colecao: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  fotografo: {
    findUnique: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Collections Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCollection", () => {
    it("should create a collection successfully", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user1" });
      (prisma.fotografo.findUnique as jest.Mock).mockResolvedValue({
        id: "foto1",
        userId: "user1",
      });
      (prisma.colecao.findUnique as jest.Mock).mockResolvedValue(null); // Slug unique check
      (prisma.colecao.create as jest.Mock).mockResolvedValue({
        id: "col1",
        nome: "Test Collection",
      });

      const formData = new FormData();
      formData.append("nome", "Test Collection");
      formData.append("status", "RASCUNHO");

      const result = await createCollection(formData);

      expect(result.success).toBe(true);
      expect(prisma.colecao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nome: "Test Collection",
            fotografoId: "foto1",
          }),
        }),
      );
    });

    it("should return error if unauthorized", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("nome", "Test");

      const result = await createCollection(formData);
      expect(result.error).toBe("Não autorizado");
    });
  });

  describe("getCollections", () => {
    it("should fetch collections with filters", async () => {
      (prisma.colecao.findMany as jest.Mock).mockResolvedValue([]);

      await getCollections({ fotografoId: "foto1" });

      expect(prisma.colecao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fotografoId: "foto1" },
        }),
      );
    });
  });

  describe("updateCollection", () => {
    it("should update valid collection", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user1" });
      (prisma.colecao.findUnique as jest.Mock).mockResolvedValue({
        id: "col1",
        fotografo: { userId: "user1" },
      });
      (prisma.colecao.update as jest.Mock).mockResolvedValue({
        id: "col1",
        nome: "Updated",
      });

      const result = await updateCollection("col1", { nome: "Updated" });

      expect(result.success).toBe(true);
      expect(prisma.colecao.update).toHaveBeenCalled();
    });

    it("should deny if user is not owner", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user2" });
      (prisma.colecao.findUnique as jest.Mock).mockResolvedValue({
        id: "col1",
        fotografo: { userId: "user1" },
      });

      const result = await updateCollection("col1", { nome: "Updated" });

      expect(result.error).toBeDefined();
    });
  });
});
