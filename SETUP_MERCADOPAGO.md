# Configuração do Mercado Pago

Este guia explica como configurar o Mercado Pago para processar pagamentos no GTClicks.

## 1. Criar Conta no Mercado Pago

1. Acesse [https://www.mercadopago.com.br/](https://www.mercadopago.com.br/)
2. Crie uma conta empresarial
3. Complete o processo de verificação

## 2. Obter Credenciais

### Ambiente de Testes (Desenvolvimento)

1. Acesse o [Painel de Desenvolvedor](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Suas aplicações** → **Criar aplicação**
3. Escolha **Checkout Pro** como produto
4. Copie o **Access Token** de teste

### Ambiente de Produção

1. No mesmo painel, ative o modo **Produção**
2. Copie o **Access Token** de produção
3. **IMPORTANTE**: Nunca compartilhe suas credenciais de produção

## 3. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui

# URL da aplicação (necessário para webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Em produção: https://seudominio.com
```

## 4. Configurar Webhook (Produção)

O webhook permite que o Mercado Pago notifique seu sistema quando um pagamento é processado.

### 4.1 Expor Webhook Localmente (Desenvolvimento)

Para testar webhooks localmente, use **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor sua aplicação local
ngrok http 3000
```

Ngrok fornecerá uma URL pública (ex: `https://abc123.ngrok.io`). Use essa URL no passo seguinte.

### 4.2 Registrar Webhook no Mercado Pago

1. Vá em **Painel de Desenvolvedor** → **Suas aplicações**
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Configure a URL:
   - **Desenvolvimento**: `https://seu-ngrok.ngrok.io/api/webhooks/mercadopago`
   - **Produção**: `https://seudominio.com/api/webhooks/mercadopago`
5. Selecione eventos: `payment`
6. Salve

## 5. Testar Pagamentos

### Cartões de Teste

O Mercado Pago fornece cartões de teste para simular diferentes cenários:

| Cenário | Cartão | CVV | Data |
|---------|--------|-----|------|
| Aprovado | 5031 4332 1540 6351 | 123 | 11/25 |
| Recusado | 5031 4332 1540 6351 | 123 | 11/25 |
| Pendente | 5031 7557 3453 0604 | 123 | 11/25 |

**CPF de teste**: Qualquer CPF válido

### Fluxo de Teste

1. Adicione fotos ao carrinho
2. Vá para checkout
3. Clique em "Ir para Pagamento"
4. Use um dos cartões de teste acima
5. Complete o pagamento
6. Verifique se o pedido aparece em "Meus Downloads"

## 6. Produção

Antes de ir para produção:

1. ✅ Substitua o `MERCADOPAGO_ACCESS_TOKEN` pelo token de produção
2. ✅ Configure `NEXT_PUBLIC_APP_URL` com seu domínio real
3. ✅ Registre o webhook com a URL de produção
4. ✅ Teste todo o fluxo em modo teste antes de liberar
5. ✅ Ative SSL/HTTPS no seu domínio (obrigatório)

## 7. Monitoramento

- Acesse o painel do Mercado Pago para ver transações em tempo real
- Logs do webhook aparecem no console do servidor Next.js
- Em produção, configure alertas para webhooks falhados

## Troubleshooting

### Webhook não está sendo chamado

1. Verifique se a URL está acessível publicamente
2. Confirme que a URL está registrada no painel do MP
3. Verifique os logs do Mercado Pago para ver erros

### Pagamento aprovado mas pedido não atualiza

1. Verifique os logs do webhook no servidor
2. Confirme que o `external_reference` do pagamento corresponde ao `pedidoId`
3. Verifique se o banco de dados está acessível

### Erro "Mercado Pago não configurado"

1. Confirme que `MERCADOPAGO_ACCESS_TOKEN` está no `.env`
2. Reinicie o servidor Next.js após adicionar variáveis
3. Verifique se não há espaços extras no token

## Referências

- [Documentação Oficial do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
