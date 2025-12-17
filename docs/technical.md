# GTClicks - Documentação Técnica (v1.1)

## 1. Visão Geral do Projeto
O GTClicks é um marketplace especializado para fotógrafos venderem ativos digitais (fotos) diretamente para clientes. A plataforma gerencia portfólios, uploads seguros, transações de e-commerce e divisão automatizada de comissões.

## 2. Stack Tecnológico
*   **Framework**: Next.js 15+ (App Router)
*   **Linguagem**: JavaScript / Node.js
*   **Banco de Dados**: PostgreSQL
*   **ORM**: Prisma
*   **Estilização**: Tailwind CSS + ShadcnUI
*   **Armazenamento**: AWS S3 (Uploads Diretos via URLs Pré-assinadas)
*   **Autenticação**: Stack Auth (Sincronizado via `Upsert` com tabela local `User`)
*   **Testes**: Jest (Unitários/Integração) + Playwright (E2E)
*   **Validação**: Zod schema validation

## 3. Arquitetura e Fluxos Críticos

### 3.1 Autenticação e Sincronização de Usuários (Robustez)
*   **Estratégia**: "Sync-on-Demand" com `upsert`.
*   **Fluxo**: Ao receber uma requisição autenticada, verificamos se o usuário existe localmente. Se não, criamos imediatamente para evitar inconsistências (Foreign Key constraints falhando).
*   **Padrão de Código Recomandado**:
    ```javascript
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) throw new UnauthorizedError();
    const user = await prisma.user.upsert({ ... });
    ```

### 3.2 Pipeline de Upload e Segurança (Anti-Fraude)
1.  **Requisição de Upload**: Cliente pede URL assinada.
2.  **Upload Direto**: Cliente envia para S3.
3.  **Confirmação/Validação**: Cliente chama `POST /api/fotos/batch`.
    *   **Mitigação de Fraude**: O sistema deve verificar a existência do arquivo no S3 (`headObject`) antes de confirmar a criação no banco.
    *   **Estados da Foto**: `RASCUNHO` (Upload pendente) -> `ATIVA` (Confirmada) -> `BLOQUEADA` (Moderação).
4.  **Convenção de Paths**:
    *   Original: `/original/{fotoId}.jpg` (bucket privado)
    *   Preview: `/preview/{fotoId}.webp` (bucket público/assinado, marca d'água futura)

### 3.3 E-commerce e Financeiro (Idempotência)
1.  **Pedido**: Criado com status `PENDENTE`.
2.  **Snapshot**: `ItemPedido` salva `precoPago`, `fotoId` e `comissaoAplicada` para auditoria estática.
3.  **Webhook de Pagamento**:
    *   **Regra de Ouro**: Idempotência. Verificar se `Pedido.status === 'PAGO'` antes de processar.
    *   **Fluxo**: Recebe Webhook -> Verifica Assinatura -> Verifica Status Atual -> Atualiza Status -> Credita Saldo -> Registra Transação.

## 4. Schema e Convenções

### Modelos Chave
*   **User/Fotografo**: Sync 1:1 com Auth Provider.
*   **Saldo/Transacao**: Livro razão imutável.

### Estados Importantes
*   **Pedido**: `PENDENTE` | `PAGO` | `CANCELADO`
*   **Foto**: `PENDENTE` | `PUBLICADA` | `REJEITADA`

## 5. Estratégia de Testes (Refinada)

### Integração (Jest)
*   **Upload**: Tentar salvar foto em nome de outro usuário (Ownership Check).
*   **Fraude**: Tentar salvar metadados de arquivo inexistente.
*   **Financeiro**: Simular Webhook duplicado (garantir crédito único).

### E2E (Playwright)
*   **Fluxo do Cliente**: Add ao Carrinho -> Checkout -> Download.
*   **Segurança**: Tentar acessar URL de download sem ter comprado (403).

## 6. Roadmap Técnico (Melhorias Futuras)
1.  **CloudFront**: CDN para entrega rápida de previews.
2.  **Watermark**: Lambda Trigger no S3 para gerar previews com marca d'água automática.
3.  **Saques Automáticos**: Integração com API de PIX para `SolicitacaoSaque`.
4.  **Centralização de Auth**: Middleware ou Helper único `assertUserOwnsResource`.

## 7. Variáveis de Ambiente
```
DATABASE_URL=...
NEXT_PUBLIC_STACK_PROJECT_ID=...
S3_UPLOAD_BUCKET=...
```
