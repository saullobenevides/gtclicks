/**
 * Testes para PUT e DELETE /api/folders/[id]
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status ?? 200,
      json: async () => data,
      headers: new Map(),
    }),
  },
}));
jest.mock("@/stack/server", () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));
jest.mock("@/lib/prisma", () => ({
  folder: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));

import { PUT, DELETE } from "../route";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

const mockParams = (id) => ({ id });

describe("/api/folders/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT", () => {
    it("retorna 401 se não autenticado", async () => {
      stackServerApp.getUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "PUT",
        body: JSON.stringify({ nome: "Pasta Atualizada" }),
      });
      const response = await PUT(request, { params: mockParams("folder-1") });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prisma.folder.update).not.toHaveBeenCalled();
    });

    it("retorna 403 quando pasta não pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.folder.findUnique.mockResolvedValue({
        id: "folder-1",
        colecao: { fotografo: { userId: "other-user" } },
      });

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "PUT",
        body: JSON.stringify({ nome: "Pasta Atualizada" }),
      });
      const response = await PUT(request, { params: mockParams("folder-1") });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Pasta não encontrada ou sem permissão");
      expect(prisma.folder.update).not.toHaveBeenCalled();
    });

    it("retorna 200 e atualiza pasta quando pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.folder.findUnique.mockResolvedValue({
        id: "folder-1",
        colecao: { fotografo: { userId: "user-1" } },
      });
      prisma.folder.update.mockResolvedValue({
        id: "folder-1",
        nome: "Pasta Atualizada",
        parentId: null,
      });

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "PUT",
        body: JSON.stringify({ nome: "Pasta Atualizada" }),
      });
      const response = await PUT(request, { params: mockParams("folder-1") });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.nome).toBe("Pasta Atualizada");
      expect(prisma.folder.update).toHaveBeenCalledWith({
        where: { id: "folder-1" },
        data: expect.objectContaining({ nome: "Pasta Atualizada" }),
      });
    });
  });

  describe("DELETE", () => {
    it("retorna 401 se não autenticado", async () => {
      stackServerApp.getUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: mockParams("folder-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prisma.folder.delete).not.toHaveBeenCalled();
    });

    it("retorna 403 quando pasta não pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.folder.findUnique.mockResolvedValue({
        id: "folder-1",
        colecao: { fotografo: { userId: "other-user" } },
      });

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: mockParams("folder-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Pasta não encontrada ou sem permissão");
      expect(prisma.folder.delete).not.toHaveBeenCalled();
    });

    it("retorna 200 e deleta pasta quando pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.folder.findUnique.mockResolvedValue({
        id: "folder-1",
        colecao: { fotografo: { userId: "user-1" } },
      });
      prisma.folder.delete.mockResolvedValue({ id: "folder-1" });

      const request = new Request("http://localhost/api/folders/folder-1", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: mockParams("folder-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.folder.delete).toHaveBeenCalledWith({
        where: { id: "folder-1" },
      });
    });
  });
});
