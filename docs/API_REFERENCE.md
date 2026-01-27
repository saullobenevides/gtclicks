# API Reference - GTClicks

Documentação dos endpoints da API REST do GTClicks.

**Base URL**: `/api`

---

## Autenticação

Todos os endpoints protegidos requerem um usuário autenticado via Stack Auth.

---

## Endpoints

### 🔐 Auth

| Método | Endpoint         | Descrição                                     |
| ------ | ---------------- | --------------------------------------------- |
| POST   | `/api/auth/sync` | Sincroniza usuário Stack Auth com banco local |
| POST   | `/api/auth/code` | Valida código de autenticação                 |

---

### 👤 Users

| Método | Endpoint                  | Descrição                               | Auth |
| ------ | ------------------------- | --------------------------------------- | ---- |
| GET    | `/api/users/me`           | Retorna dados do usuário logado         | ✅   |
| GET    | `/api/users/me/dashboard` | Retorna dados para dashboard do usuário | ✅   |
| GET    | `/api/users/me/likes`     | Lista fotos curtidas pelo usuário       | ✅   |
| POST   | `/api/users/sync`         | Sincroniza dados do usuário             | ✅   |

---

### 📸 Coleções

| Método | Endpoint                     | Descrição                                       | Auth |
| ------ | ---------------------------- | ----------------------------------------------- | ---- |
| GET    | `/api/colecoes`              | Lista coleções (filtro opcional: `fotografoId`) | ❌   |
| POST   | `/api/colecoes`              | Cria nova coleção                               | ✅   |
| GET    | `/api/colecoes/[id]`         | Detalhes de uma coleção                         | ❌   |
| PUT    | `/api/colecoes/[id]`         | Atualiza coleção                                | ✅   |
| POST   | `/api/colecoes/create-draft` | Cria coleção rascunho                           | ✅   |

**Parâmetros GET `/api/colecoes`:**

- `fotografoId` (opcional): Filtra por fotógrafo

---

### 🖼️ Fotos

| Método | Endpoint                | Descrição                 | Auth |
| ------ | ----------------------- | ------------------------- | ---- |
| GET    | `/api/fotos`            | Lista fotos               | ❌   |
| GET    | `/api/fotos/[id]`       | Detalhes de uma foto      | ❌   |
| POST   | `/api/fotos/batch`      | Operação em lote de fotos | ✅   |
| GET    | `/api/photos/[id]`      | Detalhes de foto (alias)  | ❌   |
| POST   | `/api/photos/[id]/like` | Curte uma foto            | ✅   |
| DELETE | `/api/photos/[id]/like` | Remove curtida            | ✅   |

---

### 📂 Folders

| Método | Endpoint            | Descrição             | Auth |
| ------ | ------------------- | --------------------- | ---- |
| GET    | `/api/folders/[id]` | Detalhes de uma pasta | ❌   |
| POST   | `/api/folders`      | Cria nova pasta       | ✅   |

---

### 🛒 Carrinho

| Método | Endpoint             | Descrição                        | Auth |
| ------ | -------------------- | -------------------------------- | ---- |
| DELETE | `/api/carrinho`      | Limpa todo o carrinho            | ✅   |
| POST   | `/api/carrinho/item` | Adiciona item ao carrinho        | ✅   |
| DELETE | `/api/carrinho/item` | Remove item do carrinho          | ✅   |
| POST   | `/api/carrinho/sync` | Sincroniza carrinho com servidor | ✅   |

---

### 📦 Pedidos

| Método | Endpoint            | Descrição                       | Auth |
| ------ | ------------------- | ------------------------------- | ---- |
| GET    | `/api/pedidos`      | Lista pedidos do usuário logado | ✅   |
| POST   | `/api/pedidos`      | Cria novo pedido                | ✅   |
| GET    | `/api/pedidos/[id]` | Detalhes de um pedido           | ✅   |

**POST `/api/pedidos` Body:**

```json
{
  "itens": [{ "fotoId": "...", "licencaId": "..." }],
  "checkoutSessionId": "...",
  "paymentProvider": "mercadopago"
}
```

---

### 📷 Fotógrafos

| Método | Endpoint                                 | Descrição                      | Auth |
| ------ | ---------------------------------------- | ------------------------------ | ---- |
| GET    | `/api/fotografos/by-username/[username]` | Perfil público do fotógrafo    | ❌   |
| POST   | `/api/fotografos/create`                 | Cria perfil de fotógrafo       | ✅   |
| PUT    | `/api/fotografos/update`                 | Atualiza perfil                | ✅   |
| POST   | `/api/fotografos/onboarding`             | Completa onboarding            | ✅   |
| GET    | `/api/fotografos/resolve`                | Resolve ID do fotógrafo logado | ✅   |
| GET    | `/api/fotografos/financeiro`             | Dados financeiros              | ✅   |
| GET    | `/api/fotografos/fotos`                  | Lista fotos do fotógrafo       | ✅   |
| GET    | `/api/fotografos/pix`                    | Dados PIX cadastrados          | ✅   |
| PUT    | `/api/fotografos/pix`                    | Atualiza dados PIX             | ✅   |
| POST   | `/api/fotografos/saques`                 | Solicita saque                 | ✅   |
| GET    | `/api/fotografos/saques`                 | Lista saques                   | ✅   |

---

### 💳 Pagamentos

| Método | Endpoint                      | Descrição                     | Auth |
| ------ | ----------------------------- | ----------------------------- | ---- |
| POST   | `/api/mercadopago/preference` | Cria preferência de pagamento | ✅   |
| POST   | `/api/webhooks/mercadopago`   | Webhook de notificações       | ❌   |

---

### 📥 Downloads

| Método | Endpoint                  | Descrição                   | Auth |
| ------ | ------------------------- | --------------------------- | ---- |
| GET    | `/api/download/[orderId]` | Download de fotos compradas | ✅   |
| GET    | `/api/meus-downloads`     | Lista downloads disponíveis | ✅   |

---

### ⬆️ Upload

| Método | Endpoint                    | Descrição                        | Auth |
| ------ | --------------------------- | -------------------------------- | ---- |
| POST   | `/api/upload/presigned-url` | Gera URL assinada para upload S3 | ✅   |
| POST   | `/api/upload/process`       | Processa foto após upload        | ✅   |

---

### 🏛️ Admin

| Método | Endpoint                              | Descrição                     | Auth  |
| ------ | ------------------------------------- | ----------------------------- | ----- |
| GET    | `/api/admin/stats`                    | Estatísticas do dashboard     | Admin |
| GET    | `/api/admin/users`                    | Lista usuários                | Admin |
| PUT    | `/api/admin/users/[id]`               | Atualiza usuário              | Admin |
| PUT    | `/api/admin/users/[id]/suspend`       | Suspende usuário              | Admin |
| GET    | `/api/admin/collections`              | Lista coleções para moderação | Admin |
| PUT    | `/api/admin/collections/[id]/approve` | Aprova coleção                | Admin |
| PUT    | `/api/admin/collections/[id]/reject`  | Rejeita coleção               | Admin |
| GET    | `/api/admin/orders`                   | Lista todos os pedidos        | Admin |
| GET    | `/api/admin/saques`                   | Lista solicitações de saque   | Admin |
| PUT    | `/api/admin/saques/[id]`              | Processa saque                | Admin |
| GET    | `/api/admin/config`                   | Configurações do sistema      | Admin |

---

### 📊 Analytics

| Método | Endpoint               | Descrição                    | Auth |
| ------ | ---------------------- | ---------------------------- | ---- |
| POST   | `/api/analytics/event` | Registra evento de analytics | ❌   |

---

### 📜 Licenças

| Método | Endpoint        | Descrição                          | Auth |
| ------ | --------------- | ---------------------------------- | ---- |
| GET    | `/api/licencas` | Lista tipos de licença disponíveis | ❌   |

---

## Códigos de Status

| Código | Significado               |
| ------ | ------------------------- |
| 200    | Sucesso                   |
| 201    | Criado com sucesso        |
| 400    | Requisição inválida       |
| 401    | Não autorizado            |
| 403    | Acesso negado (permissão) |
| 404    | Recurso não encontrado    |
| 500    | Erro interno do servidor  |

---

## Notas

- Endpoints marcados com **Admin** requerem `user.role === "ADMIN"`
- Uploads usam URLs assinadas do S3 (7 dias de validade)
- Webhooks do MercadoPago são verificados por assinatura
