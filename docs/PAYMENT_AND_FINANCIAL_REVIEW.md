# Revisão: Sistema de Pagamento e Financeiro (Asaas vs Mercado Pago)

Revisão do sistema de pagamento, saque e financeiro para garantir que o fluxo principal está em Asaas e que referências ao Mercado Pago estão condicionadas ou documentadas.

---

## Resumo executivo

| Área | Estado | Observação |
|------|--------|------------|
| **Checkout (compra)** | ✅ Asaas | Página de checkout usa `/api/asaas/create-checkout`; redireciona para Asaas PIX. |
| **Webhook compra aprovada** | ✅ Asaas | `/api/webhooks/asaas` trata `CHECKOUT_PAID` e `PAYMENT_*`; notifica comprador e fotógrafo; libera download. |
| **Verificação de pagamento** | ✅ Híbrido | Pedidos sem `paymentId` (Asaas): só lê status do banco. Com `paymentId` (legado MP): consulta MP. |
| **Saques (payout)** | ✅ Asaas | `lib/payouts.ts` usa Asaas quando `isAsaasConfigured()`; fallback MP (manual) se não. |
| **Webhook autorização saque** | ✅ Asaas | `/api/webhooks/asaas/transfer-auth` aprova transferências automaticamente (sem SMS). |
| **Admin pedidos** | ✅ Genérico | Label "Pagamento" e "Copiar ID"; texto de reembolso sem citar MP. |
| **Reembolso (refund)** | ✅ Híbrido | UUID = Asaas (POST `/v3/payments/{id}/refund`); numérico + MP config = Mercado Pago. |
| **GET detalhes pagamento** | ✅ Híbrido | UUID = retorna "Pago via Asaas" sem chamar MP; numérico = consulta MP (legado). |
| **Auditoria (admin)** | ✅ Condicional | Checagem de status MP só roda se `MERCADOPAGO_ACCESS_TOKEN` estiver definido. |
| **Payment Brick / checkout transparente** | ⚠️ Legado MP | `PaymentBrick.tsx` e `/api/checkout/process`, `/api/mercadopago/create-preference`: **não usados** pelo checkout atual (só Asaas). Podem ser removidos ou mantidos para legado. |

---

## Fluxos em produção (Asaas)

1. **Compra**
   - Cliente em `/checkout` preenche CPF, telefone, endereço, etc.
   - POST `/api/asaas/create-checkout` → cria checkout Asaas e redireciona para página Asaas.
   - Cliente paga PIX no Asaas.
   - Asaas envia webhook (Checkouts) para `POST /api/webhooks/asaas` com evento `CHECKOUT_PAID` (ou cobrança com `PAYMENT_*`).
   - Webhook: marca pedido PAGO, credita fotógrafo, notifica comprador e fotógrafo, envia e-mail, libera download.

2. **Saque**
   - Fotógrafo solicita saque em Financeiro; `requestWithdrawal` → cria `SolicitacaoSaque` e chama `processPayoutForSaque`.
   - Se Asaas configurado: `sendPixTransfer` (Asaas) cria a transferência.
   - Asaas envia POST para `/api/webhooks/asaas/transfer-auth`; a API responde `APPROVED` e o saque é liberado sem SMS.

3. **Reembolso (admin)**
   - Admin em pedido PAGO clica em Reembolsar.
   - `paymentId` em formato UUID → reembolso via Asaas (`POST /v3/payments/{id}/refund`).
   - `paymentId` numérico e MP configurado → reembolso via Mercado Pago (legado).

---

## Onde o Mercado Pago ainda aparece (legado ou condicional)

- **`lib/mercadopago.ts`** e **`lib/payouts.ts`**: fallback de saque quando Asaas não está configurado (retorna “processamento manual”).
- **`app/api/pedidos/[id]/verificar-pagamento`**: para pedidos **com** `paymentId` numérico, consulta MP para sincronizar status.
- **`app/api/pedidos/[id]/pagamento`**: para `paymentId` numérico, busca PIX/boleto no MP (pedidos antigos).
- **`app/api/admin/pedidos/[id]/refund`**: reembolso MP quando `paymentId` é numérico e `MERCADOPAGO_ACCESS_TOKEN` está definido.
- **`app/api/admin/audit`**: checagem de divergência de status só roda se `MERCADOPAGO_ACCESS_TOKEN` estiver definido e `paymentId` for numérico.
- **`components/checkout/PaymentBrick.tsx`**, **`app/api/checkout/process`**, **`app/api/mercadopago/create-preference`**, **`app/api/webhooks/mercadopago`**: fluxo de checkout transparente MP; **não é usado** pelo fluxo atual (apenas Asaas). Podem ser mantidos para pedidos antigos ou removidos em limpeza futura.

---

## Variáveis de ambiente

- **Asaas (obrigatório para checkout e saque atual):** `ASAAS_API_KEY`, `NEXT_PUBLIC_APP_URL`.
- **Webhook compra:** `ASAAS_WEBHOOK_TOKEN` (opcional); URL em Asaas: `{APP_URL}/api/webhooks/asaas`; ativar evento **Checkouts**.
- **Webhook saque:** `ASAAS_WEBHOOK_TRANSFER_TOKEN` (opcional); URL em Asaas (Mecanismos de segurança): `{APP_URL}/api/webhooks/asaas/transfer-auth`.
- **Mercado Pago (opcional, legado):** `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`; só necessários para pedidos/saques antigos ou auditoria MP.

---

## Checklist pós-revisão

- [x] Checkout usa apenas Asaas (redirect).
- [x] Webhook de compra (Checkouts) notifica comprador e fotógrafo e libera download.
- [x] Saque usa Asaas quando configurado; webhook de transfer-auth aprova sem SMS.
- [x] Admin pedidos com labels genéricos (Pagamento / ID).
- [x] Reembolso suporta Asaas (UUID) e MP (numérico).
- [x] GET pagamento não chama MP quando `paymentId` é UUID (Asaas).
- [x] Auditoria só consulta MP se token MP estiver configurado.
- [ ] (Opcional) Remover ou desativar Payment Brick e rotas MP de checkout se não houver mais uso legado.
