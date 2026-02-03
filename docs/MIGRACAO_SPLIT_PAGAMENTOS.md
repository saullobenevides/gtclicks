# Migração para Mercado Pago Split de Pagamentos

> **Decisão (fev/2025):** Seguir com **Stripe Connect** em vez de MP Split. Ver [MIGRACAO_STRIPE_CONNECT.md](./MIGRACAO_STRIPE_CONNECT.md).

## Visão geral

O Split de Pagamentos divide automaticamente o valor entre plataforma e fotógrafo no momento do pagamento. O dinheiro vai direto para a conta MP do fotógrafo — não há mais ledger interno nem aprovação manual de saques.

---

## Pré-requisitos

| Requisito             | Descrição                                            |
| --------------------- | ---------------------------------------------------- |
| **Conta vendedor MP** | Conta Mercado Pago com KYC nível 6                   |
| **Aplicativo MP**     | Para gerenciar recebimentos                          |
| **OAuth**             | Cada fotógrafo precisa vincular conta MP via OAuth   |
| **Checkout**          | Pro, Transparente ou Bricks (compatível com o atual) |

---

## Modelos disponíveis

### Modelo 1:1 (disponível na documentação)

- Um vendedor por pagamento
- Cada pagamento usa o `access_token` de um único fotógrafo
- **Problema para GTClicks**: Um pedido pode ter fotos de **vários fotógrafos**. Com 1:1, precisaríamos criar múltiplos pagamentos ou escolher um “vendedor principal”.

### Modelo 1:N (requer contato comercial)

- Múltiplos vendedores por pagamento
- Ideal para marketplaces com itens de vários vendedores no mesmo carrinho
- **Requer**: Falar com executivo comercial do Mercado Pago (carteira assessorada)

---

## Fluxo com Split (modelo 1:1 simplificado)

1. **Onboarding do fotógrafo**

   - Fotógrafo clica em “Vincular Mercado Pago”
   - Redirecionado para `auth.mercadopago.com.br/authorization`
   - Autoriza e volta com `code`
   - Backend troca `code` por `access_token` + `refresh_token`
   - Salva `access_token`, `collector_id` (user_id) no `Fotografo`

2. **Checkout**

   - Para cada item, identifica o fotógrafo dono da foto
   - Se pedido tem itens de **um só fotógrafo**: usa o `access_token` dele na API de pagamento
   - Envia `application_fee` = comissão da plataforma (ex: 10% do total)
   - O restante cai na conta MP do fotógrafo

3. **Saque**
   - O fotógrafo saca direto do app/site do Mercado Pago (Pix, conta bancária)
   - A plataforma não faz mais `sendPixPayout`

---

## O que muda no código

| Área                 | Atual                                | Com Split                                                                       |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| **Fotografo**        | `chavePix`, `mercadopagoCustomerId`  | + `mercadopagoAccessToken`, `mercadopagoCollectorId`, `mercadopagoRefreshToken` |
| **Checkout**         | Um pagamento com token da plataforma | Pagamento com `access_token` do fotógrafo + `application_fee`                   |
| **Webhook**          | Credita Saldo, cria Transacao        | Só atualiza Pedido; saldo fica na conta MP do fotógrafo                         |
| **Saldo/Transacao**  | Ledger interno                       | Pode manter para histórico ou remover                                           |
| **SolicitacaoSaque** | Admin aprova → Pix via API           | **Removido** — fotógrafo saca direto no MP                                      |
| **Admin saques**     | Página de aprovação                  | **Removida**                                                                    |

---

## Limitação: pedidos com múltiplos fotógrafos

Com modelo **1:1**, um pagamento só pode ter um vendedor. Opções:

1. **Criar um pagamento por fotógrafo**

   - Carrinho com 2 fotos de A e 1 de B → 2 pagamentos (um para A, um para B)
   - UX mais complexa (vários passos de pagamento)

2. **Usar o fotógrafo “principal”**

   - Um pagamento com o fotógrafo do item de maior valor
   - A plataforma recebe tudo e repassa manualmente aos outros (volta ao modelo atual)

3. **Solicitar modelo 1:N**
   - Contato comercial MP para carteira assessorada
   - Um pagamento com split para vários fotógrafos

---

## Próximos passos recomendados

### Fase 1: Validação

1. [ ] Entrar em contato com o Mercado Pago (https://www.mercadopago.com.br/quero-usar/)
2. [ ] Confirmar se o modelo 1:N está disponível para o GTClicks
3. [ ] Entender prazos e requisitos de contrato/comercial

### Fase 2: Se 1:N for aprovado

1. [ ] Criar aplicação MP no painel (modelo Marketplace)
2. [ ] Implementar fluxo OAuth (redirect, callback, troca de code por token)
3. [ ] Adicionar campos no modelo `Fotografo` (tokens, collector_id)
4. [ ] Adaptar checkout para enviar split por vendedor
5. [ ] Ajustar webhook (sem crédito em Saldo)
6. [ ] Remover fluxo de saques manuais e página de admin

### Fase 3: Se só 1:1 for viável

1. [ ] Avaliar: restringir pedidos a um fotógrafo por vez?
2. [ ] Ou: manter modelo atual e só usar Split em cenários específicos

---

## Links úteis

- [Split de Pagamentos - Landing](https://www.mercadopago.com.br/developers/pt/docs/split-payments/landing)
- [Pré-requisitos](https://www.mercadopago.com.br/developers/pt/docs/split-payments/prerequisites)
- [Configuração (OAuth, criar app)](https://www.mercadopago.com.br/developers/pt/docs/split-payments/integration-configuration/create-configuration)
- [Integrar checkout](https://www.mercadopago.com.br/developers/pt/docs/split-payments/integration-configuration/integrate-marketplace)
- [Contato comercial](https://www.mercadopago.com.br/quero-usar/)
