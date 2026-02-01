/**
 * Polyfills que rodam antes de qualquer test file (setupFiles).
 * Necessário para testes de rotas Next.js que usam Request/Response.
 */
if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class Request {
    constructor(input, init = {}) {
      this.url =
        typeof input === "string" ? input : input?.url || "http://localhost";
      this.method = (init.method || "GET").toUpperCase();
      this._body = init.body;
    }
    async json() {
      if (this._body == null) return {};
      if (typeof this._body === "string") return JSON.parse(this._body);
      return this._body;
    }
  };
}
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
    }
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });
    }
  };
}
