/**
 * Testes para POST /api/admin/collections/[id]/suspend
 * Foco: requireAdminApi - sem auth retorna 401/403
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
jest.mock("@/lib/admin/permissions", () => ({
  requireAdminApi: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  colecao: { update: jest.fn() },
}));

import { POST } from "../route";
import { requireAdminApi } from "@/lib/admin/permissions";
import prisma from "@/lib/prisma";

describe("POST /api/admin/collections/[id]/suspend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 quando não autenticado", async () => {
    requireAdminApi.mockResolvedValue({
      ok: false,
      response: {
        status: 401,
        json: async () => ({ error: "Autenticação necessária" }),
      },
    });

    const request = new Request("http://localhost/api/admin/collections/col-1/suspend", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Autenticação necessária");
    expect(prisma.colecao.update).not.toHaveBeenCalled();
  });

  it("retorna 403 quando usuário não é admin", async () => {
    requireAdminApi.mockResolvedValue({
      ok: false,
      response: {
        status: 403,
        json: async () => ({ error: "Acesso negado. Apenas administradores." }),
      },
    });

    const request = new Request("http://localhost/api/admin/collections/col-1/suspend", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("administradores");
    expect(prisma.colecao.update).not.toHaveBeenCalled();
  });

  it("retorna 200 e suspende coleção quando admin autenticado", async () => {
    requireAdminApi.mockResolvedValue({
      ok: true,
      admin: { id: "admin-1", name: "Admin", email: "admin@test.com" },
    });
    prisma.colecao.update.mockResolvedValue({
      id: "col-1",
      status: "RASCUNHO",
    });

    const request = new Request("http://localhost/api/admin/collections/col-1/suspend", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.colecao.update).toHaveBeenCalledWith({
      where: { id: "col-1" },
      data: { status: "RASCUNHO" },
    });
  });
});
