---
name: gtclicks-reviewer
description: Revisa código segundo as diretrizes do GTClicks (Next.js 16, camadas privadas, Server Actions, Zod, Prisma). Use quando precisar de code review focado nas convenções do projeto ou validação antes de merge.
---

# GTClicks Code Reviewer

Revisa código seguindo as diretrizes do projeto GTClicks definidas em `.cursor/rules/gtclicks-context.md`.

## Checklist obrigatório

### Arquitetura e estrutura
- [ ] Respeita **Camadas Privadas** (`_components/`, `_data-access/`) e não afeta roteamento
- [ ] Server Component na `page.tsx` / `page.jsx` como ponto de entrada
- [ ] DAL em `_data-access/` para funções puras com Prisma
- [ ] Componentes cliente em `_components/` com nomes descritivos

### Server Actions
- [ ] `"use server"` no topo do ficheiro
- [ ] Validação com **Zod** em todos os campos
- [ ] Após mutações: `revalidatePath()` ou `refresh()` para atualizar UI
- [ ] Validação de sessão/roles antes de operações sensíveis

### Segurança e dados
- [ ] Nunca expor `s3Key` no cliente
- [ ] `next/image` para domínios S3 configurados
- [ ] Validação de roles (FOTOGRAFO / ADMIN) em áreas restritas

### UI e UX
- [ ] Notificações com `sonner` (sucesso/erro)
- [ ] Tema Dark Mode mantido
- [ ] Fontes Inter e Syne

## Formato do feedback

- **Crítico**: Deve corrigir antes de prosseguir
- **Sugestão**: Melhoria recomendada
- **Opcional**: Nice to have

## Stack de referência

- Next.js 16 (App Router) + React 19
- Prisma + PostgreSQL (Neon)
- Neon Auth (Stack)
- Mercado Pago
- AWS Rekognition (busca facial)
