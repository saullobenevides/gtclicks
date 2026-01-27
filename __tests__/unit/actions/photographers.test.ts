import {
  createPhotographer,
  updatePhotographer,
} from "@/actions/photographers";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

jest.mock("@/lib/prisma", () => ({
  fotografo: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Photographers Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPhotographer", () => {
    it("should create new photographer and upgrade user role", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({
        id: "user1",
        email: "test@test.com",
      });
      (prisma.fotografo.findUnique as jest.Mock).mockResolvedValue(null); // Not existing
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user1",
        role: "USER",
      });
      (prisma.fotografo.create as jest.Mock).mockResolvedValue({
        id: "foto1",
        username: "test",
      });

      const formData = new FormData();
      formData.append("username", "testuser");

      const result = await createPhotographer(formData);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user1" },
          data: { role: "FOTOGRAFO" },
        }),
      );
      expect(prisma.fotografo.create).toHaveBeenCalled();
    });
  });

  describe("updatePhotographer", () => {
    it("should update profile with especialidades", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user1" });
      (prisma.fotografo.update as jest.Mock).mockResolvedValue({
        id: "foto1",
        bio: "Updated",
      });

      const formData = new FormData();
      formData.append("bio", "Updated");
      formData.append("especialidades", "Weddings");
      formData.append("especialidades", "Sports");

      const result = await updatePhotographer(formData);

      expect(result.success).toBe(true);
      expect(prisma.fotografo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user1" },
          data: expect.objectContaining({
            bio: "Updated",
            especialidades: ["Weddings", "Sports"],
          }),
        }),
      );
    });
  });
});
