# Migração para Stripe Connect

## Decisão

Seguir com **Stripe Connect** em vez de Mercado Pago Split, principalmente por:

- **1:N nativo** — Split de um pagamento para múltiplos fotógrafos sem contato comercial
- **Documentação pública** — Tudo disponível na documentação oficial
- **Brasil suportado** — Separate charges and transfers disponível para contas BR

### Trade-off

- **Saque**: Conta bancária (TED/DOC) em vez de Pix — fotógrafo cadastra banco, agência, conta

---

## Arquitetura: Separate Charges and Transfers

```
Cliente paga R$ 100 (3 fotos: Fotógrafo A, B, C)
    ↓
1 Charge na conta da plataforma (Stripe Checkout ou Payment Element)
    ↓
Webhook: charge.succeeded
    ↓
Criar Transfers (um por fotógrafo):
  - Transfer 1: R$ 36 → Connected Account A (90% de R$40)
  - Transfer 2: R$ 31,50 → Connected Account B (90% de R$35)
  - Transfer 3: R$ 22,50 → Connected Account C (90% de R$25)
    ↓
Restante: R$ 10 na plataforma (comissão) + taxas Stripe
```

O fotógrafo recebe na conta Stripe Connect e saca para conta bancária (TED) pelo próprio Stripe.

---

## Pré-requisitos

| Requisito              | Descrição                                           |
| ---------------------- | --------------------------------------------------- |
| **Conta Stripe**       | Plataforma com conta Stripe Brasil (BRL)            |
| **Stripe Connect**     | Habilitar Connect no Dashboard                      |
| **Connected Accounts** | Tipo Express (recomendado) ou Custom                |
| **Conta bancária**     | Fotógrafo cadastra banco, agência, conta (CPF/CNPJ) |

---

## Experiência 100% embedada

**Sim** — o fotógrafo não precisa ir ao site/app da Stripe. Tudo fica dentro da plataforma GTClicks usando **Connect Embedded Components**:

| Funcionalidade                         | Componente           | Onde fica                        |
| -------------------------------------- | -------------------- | -------------------------------- |
| **Onboarding** (dados, conta bancária) | `account-onboarding` | Página do dashboard do fotógrafo |
| **Saldo**                              | `balances`           | Dashboard financeiro             |
| **Repasses**                           | `payouts`            | Dashboard financeiro             |
| **Pagamentos recebidos**               | `payments`           | Dashboard financeiro             |

- Formulário de onboarding: tema customizável, branding limitado da Stripe
- Suporte a `pt-BR`
- Possível customizar cores, fontes etc. via `appearance`

**Exceção:** Em alguns cenários (ex.: verificação de identidade, conta bancária), pode aparecer um **popup** da Stripe para autenticação. Não é redirecionamento — é um modal rápido na mesma aba.

---

## Fluxo do fotógrafo

### 1. Onboarding (Embedded)

1. Fotógrafo acessa dashboard → "Configurar conta para receber pagamentos"
2. Plataforma cria **Account** via API e **Account Session** (client secret)
3. Componente `account-onboarding` é renderizado **dentro da página** (Connect.js)
4. Fotógrafo preenche dados, conta bancária, documentos — tudo na plataforma
5. Ao sair do fluxo, plataforma verifica `charges_enabled` e `payouts_enabled`
6. Salva `stripeAccountId` no modelo `Fotografo`

### 2. Recebimento

- Dinheiro cai na conta Connect do fotógrafo via Transfer
- Stripe faz repasse automático para conta bancária (TED) conforme cronograma

### 3. Visualização de saldo e repasses

- Componentes `balances` e `payouts` embedados no dashboard do fotógrafo
- Fotógrafo vê tudo sem sair da plataforma

---

## Mudanças no schema (Prisma)

```prisma
model Fotografo {
  // ... campos existentes ...
  chavePix       String?   // Manter temporariamente para migração
  cpf            String?   @unique

  // Stripe Connect
  stripeAccountId String?  @unique  // acct_xxx
  stripeOnboarded Boolean  @default(false)

  // Remover depois da migração: mercadopagoCustomerId do User
}
```

---

## Mudanças no código

| Área                    | Ação                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| **Checkout**            | Trocar Payment Brick (MP) por Stripe Checkout ou Payment Element    |
| **API checkout**        | Criar PaymentIntent/Checkout Session com `transfer_group` = orderId |
| **Webhook**             | `charge.succeeded` → criar Transfers para cada fotógrafo            |
| **Onboarding**          | Nova rota `/api/fotografos/stripe-connect/onboard`                  |
| **Dashboard fotógrafo** | Botão "Configurar conta para receber pagamentos"                    |
| **Saldo/Transacao**     | Manter para histórico (opcional) ou remover                         |
| **SolicitacaoSaque**    | **Remover** — Stripe faz repasse automático                         |
| **Admin saques**        | **Remover**                                                         |
| **lib/mercadopago.js**  | Substituir por `lib/stripe.js`                                      |
| **Webhook MP**          | Substituir por webhook Stripe                                       |

---

## Fases da migração

### Fase 1: Setup Stripe (1–2 dias)

- [ ] Criar conta Stripe Brasil
- [ ] Habilitar Connect no Dashboard
- [ ] Instalar `stripe` npm package
- [ ] Configurar variáveis: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Fase 2: Onboarding fotógrafos (2–3 dias) — Embedded ✅

- [x] Instalar `@stripe/connect-js` e `@stripe/react-connect-js`
- [x] Adicionar `stripeAccountId`, `stripeOnboarded` no schema
- [x] Criar rota `POST /api/fotografos/stripe-connect/create-account` (cria Express account)
- [x] Criar rota `POST /api/fotografos/stripe-connect/account-session` (retorna client_secret para Connect.js)
- [x] Página no dashboard com componente `account-onboarding` embedado
- [x] Handler `setOnExit` para verificar status e salvar `stripeAccountId`
- [ ] Migração: fotógrafos existentes precisam fazer onboarding

### Fase 3: Checkout Stripe (3–4 dias) ✅

- [x] API `POST /api/checkout/create-payment-intent` (cria pedido + PaymentIntent com `transfer_group`)
- [x] Componente `StripePaymentElement` (Payment Element) no checkout
- [x] Fallback para Payment Brick (MP) quando Stripe não configurado
- [x] Manter fluxo de criação de Pedido antes do pagamento

### Fase 4: Webhook e Transfers (2–3 dias) ✅

- [x] Criar `app/api/webhooks/stripe/route.js`
- [x] Handler `payment_intent.succeeded` e `payment_intent.payment_failed`
- [x] Lógica: para cada item do pedido, criar Transfer para `stripeAccountId` do fotógrafo (se onboarded)
- [x] Usar `source_transaction` = charge_id para vincular transfer ao pagamento
- [x] Atualizar status do Pedido, Saldo, Transacao, notificações, email

**Webhook Stripe:** Configurar em Dashboard > Developers > Webhooks > Add endpoint:

- URL: `https://seu-dominio.com/api/webhooks/stripe`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Fase 5: Limpeza (1–2 dias)

- [ ] Remover dependências Mercado Pago (`mercadopago`, `@mercadopago/sdk-react`)
- [ ] Remover rotas: webhook MP, create-preference, saques admin
- [ ] Remover páginas: admin/saques
- [ ] Remover `chavePix` do fluxo de saque (manter só se útil para outra coisa)
- [ ] Atualizar documentação e .env.example

### Fase 6: Migração de fotógrafos

- [ ] Comunicar fotógrafos sobre nova forma de recebimento
- [ ] Cada fotógrafo precisa: fazer onboarding Stripe, cadastrar conta bancária
- [ ] Período de transição: manter MP em paralelo até migração completa? (avaliar)

---

## Formas de pagamento no Brasil (Stripe)

- Cartão de crédito (Visa, Mastercard)
- Pix (recebimento)
- Boleto
- Google/Apple Pay

---

## Pacotes para experiência embedada

```bash
npm install stripe @stripe/connect-js @stripe/react-connect-js
```

- `stripe` — backend (API, webhooks)
- `@stripe/connect-js` — Connect Embedded Components (ou `@stripe/react-connect-js` para React)

---

## Links úteis

- [Connect Embedded Components - Get Started](https://docs.stripe.com/connect/get-started-connect-embedded-components)
- [Embedded Onboarding](https://docs.stripe.com/connect/embedded-onboarding)
- [Account Onboarding Component](https://docs.stripe.com/connect/supported-embedded-components/account-onboarding)
- [Stripe Connect - Overview](https://docs.stripe.com/connect)
- [Separate Charges and Transfers](https://docs.stripe.com/connect/separate-charges-and-transfers)
- [Connect Onboarding - Express](https://docs.stripe.com/connect/express-accounts)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Webhooks](https://docs.stripe.com/webhooks)
- [Supported bank accounts in Brazil](https://support.stripe.com/questions/supported-bank-accounts-in-brazil)
- [Payout schedule Brazil](https://support.stripe.com/questions/brazil-specific-payout-schedule-and-payment-availability)
