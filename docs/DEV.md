# Desenvolvimento

Guia para desenvolvedores do GTClicks.

## Scripts opcionais (.agent/)

A pasta `.agent/` contém scripts Python usados por ferramentas de agente/IA (Cursor, Codex, etc.). **Python não é dependência do projeto**; use apenas se tiver Python no PATH.

### Durante o desenvolvimento

Para checagem incremental (segurança, lint, schema, testes, UX, SEO):

```bash
python .agent/scripts/checklist.py .
```

Com URL (inclui checagens de performance):

```bash
python .agent/scripts/checklist.py . --url http://localhost:3000
```

### Antes de releases

Para validação completa (incl. Lighthouse e E2E):

```bash
# Com o servidor rodando em http://localhost:3000
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

Inclui: security scan, lint, schema, testes, UX, SEO, Lighthouse, Playwright E2E e análises adicionais quando aplicável.

## Testes

- `npm test` — testes unitários (Jest)
- `npm run test:coverage` — cobertura
- `npm run test:e2e` — E2E (Playwright)

Ver [TESTING.md](../TESTING.md) para detalhes.

## Lint e build

- `npm run lint` — ESLint
- `npm run build` — build de produção

## Segurança

- `npm audit` — relatório de vulnerabilidades
- `npm audit fix` — correções seguras (sem breaking changes)

Ver seção "Segurança e dependências" no [README](../README.md).
