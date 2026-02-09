# Guia de Subagentes no Cursor

Subagentes são assistentes especializados que o Agent do Cursor pode delegar tarefas. Cada subagente opera numa janela de contexto própria, trata tipos específicos de trabalho e devolve o resultado ao agente pai.

## Quando usar Subagentes vs Skills

| Use subagentes quando... | Use skills quando... |
|-------------------------|----------------------|
| Precisa de isolamento de contexto para tarefas longas de pesquisa | A tarefa é de propósito único (gerar changelog, formatar) |
| Executar múltiplos fluxos em paralelo | Quer uma ação rápida e repetível |
| A tarefa requer expertise especializada em vários passos | A tarefa completa numa única execução |
| Quer verificação independente do trabalho | Não precisa de janela de contexto separada |

## Estrutura de Subagentes

Os subagentes são ficheiros **Markdown** em `.cursor/agents/` (projeto) ou `~/.cursor/agents/` (utilizador).

### Formato do ficheiro

```markdown
---
name: nome-do-subagente
description: Descrição breve do que faz e quando usá-lo
---

# Instruções do Subagente

O prompt aqui define o comportamento do subagente.
O agente pai inclui o contexto necessário na mensagem inicial.
```

### Campos do frontmatter

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | Sim | Identificador único (lowercase, hífens) |
| `description` | Sim | O que faz e quando o agente deve usá-lo |

## Subagentes Predefinidos do Cursor

O Cursor inclui três subagentes built-in:

- **Explore** – Pesquisa e analisa o codebase
- **Bash** – Executa comandos shell
- **Browser** – Controla o browser via MCP

## Como criar um subagente

1. Crie o diretório `.cursor/agents/` se não existir
2. Adicione um ficheiro `.md` com frontmatter YAML
3. Escreva o prompt com as instruções específicas
4. O Agent passa a ter acesso automático ao subagente

## Performance e Custos

- Cada subagente tem contexto próprio → **uso de tokens independente**
- Subagentes em paralelo ≈ `N × tokens` de um único agente
- Para tarefas simples, o agente principal pode ser mais rápido
- Subagentes brilham em trabalho complexo, longo ou paralelo

---

## Índice de Subagentes do GTClicks

Subagentes em `.cursor/agents/` e quando usar cada um:

### Orquestração
| Agente | Quando usar |
|--------|-------------|
| **lead-orchestrator** | Coordenar agentes especialistas em features complexas; gerar plano unificado e checklists |

### Arquitetura e código
| Agente | Quando usar |
|--------|-------------|
| **nextjs-architect** | Desenhar features, refatorar, decisões de estrutura |
| **nextjs-app-router** | Boundaries server/client, RSC, route handlers, server actions |
| **nextjs-data-fetching** | Fluxos de dados, cache, waterfalls, streaming |
| **nextjs-performance** | Gargalos de render, bundle bloat, otimização |
| **react-components** | Componentes reutilizáveis, composição, shadcn/ui |
| **refactor** | Clareza, manutenção, evitar overengineering |

### Pagamentos e webhooks
| Agente | Quando usar |
|--------|-------------|
| **payments-engineer** | Fluxos de pagamento genéricos, idempotência, reconciliation |
| **mercadopago-payments** | Integração MP, Pix/card/boleto, comissão, refunds |
| **webhook-reliability** | Inbox, retries, dead-letter, observability |

### Media e infraestrutura
| Agente | Quando usar |
|--------|-------------|
| **s3-media-pipeline** | Upload, presigned URLs, thumbnails, delivery |
| **media-upload** | Pipelines de upload, validação, virus scan |
| **image-performance** | Galerias, next/image, CDN, pagination |

### Segurança
| Agente | Quando usar |
|--------|-------------|
| **security-reviewer** | Auditoria genérica: auth, validação, injection, leaks |
| **marketplace-security** | Segurança marketplace: download, tokens, webhooks |
| **content-protection** | Acesso a conteúdo pago, signed URLs, rate limit, audit |
| **abuse-prevention** | Mass downloads, token sharing, limites, watermark |

### Admin e ops
| Agente | Quando usar |
|--------|-------------|
| **admin-tools** | Moderation, onboarding, payouts, audit logs |
| **admin-ops-mp** | Dashboards MP: pedidos, refunds, webhooks, saques |

### Produto e testes
| Agente | Quando usar |
|--------|-------------|
| **product-marketplace** | Especificar features, entidades, edge cases |
| **gtclicks-reviewer** | Code review nas convenções do GTClicks |
| **test-generator** | Testes significativos, comportamento |
| **e2e-marketplace** | E2E Playwright: signup, checkout, download |
| **verifier** | Validar implementações, rodar testes |

### Stack do projeto
- **Auth:** Stack Auth; `getAuthenticatedUser()` (lib/auth), `requireAdmin()` (lib/admin/permissions)
- **Models:** User, Fotografo, Colecao, Foto, Pedido, ItemPedido, Saldo, SolicitacaoSaque
