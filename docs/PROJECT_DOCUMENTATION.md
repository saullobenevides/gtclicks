# Documentação do Projeto GTClicks

## 1. Visão Geral

**GTClicks** é um marketplace dedicado a fotógrafos esportivos e de eventos. A plataforma permite que fotógrafos profissionais publiquem, organizem e vendam suas fotos diretamente para clientes (atletas, participantes de eventos, etc.).

O sistema foca em alta performance, upload eficiente (S3) e monetização segura (MercadoPago/PIX).

## 2. Tech Stack

O projeto utiliza um stack moderno baseado no ecossistema React/Next.js:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem**: JavaScript / TypeScript
- **Estilização**: Tailwind CSS v4, Lucide React, Radix UI (base para Shadcn/UI)
- **Banco de Dados**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Autenticação**: Stack Auth (`@stackframe/stack`)
- **Armazenamento**: AWS S3
- **Testes**: Jest, Playwright
- **Pagamentos**: MercadoPago (integração ativa), PIX (via MP).
- **Outros**: `zod` (validação), `sonner` (toasts), `sharp` (processamento de imagem)

## 3. Arquitetura do Projeto

O projeto segue a arquitetura do **Next.js App Router**, combinada com um padrão de **Features** para melhor organização de código.

### Estrutura de Diretórios Principal

- **`app/`**: Contém as rotas da aplicação (Pages) e layouts.
  - `api/`: Rotas de endpoint de API (Backend).
  - `admin/`: Painel administrativo.
  - `dashboard/`: Área logada do fotógrafo/usuário.
  - `(public)`: Rotas públicas como Home, Busca, etc.
- **`features/`**: Lógica de negócios modularizada.
  - Ex: `cart`, `collections`, `photographer`.
  - Cada feature contém seus próprios `components`, `hooks`, `context`, etc.
- **`components/`**: Componentes de UI reutilizáveis (Shared).
  - `ui/`: Componentes base (Botões, Inputs, Dialogs).
  - `layout/`: Header, Footer, Nav.
- **`lib/`**: Utilitários centrais e configurações de infraestrutura.
  - `prisma.js`: Cliente do banco de dados.
  - `s3-client.js`: Cliente AWS S3.
  - `auth.js`: Configurações de autenticação.
- **`prisma/`**: Definição do schema do banco de dados.

### Fluxo de Dados

1.  **Client Components**: Interagem com `API Routes` ou usam `Server Actions` (quando disponíveis) para buscar/enviar dados.
2.  **API Routes (`app/api`)**: Processam requisições, validam dados (Zod) e interagem com o Banco de Dados via Prisma.
3.  **Database**: PostgreSQL armazena dados relacionais.

## 4. Banco de Dados (Schema)

O schema está definido em `prisma/schema.prisma`. As principais entidades são:

- **User**: Usuário base do sistema.
  - Roles: `CLIENTE`, `FOTOGRAFO`, `ADMIN`.
- **Fotografo**: Perfil estendido para usuários que vendem fotos.
  - Portfolio, Chave PIX, Bio, Links Sociais.
- **Foto**: Produto principal.
  - Metadados EXIF, Caminho S3, Dimensões.
  - Status: `PENDENTE`, `PUBLICADA`, `REJEITADA`.
- **Colecao**: Agrupamento de fotos (Álbum/Evento).
  - Pode conter sub-pastas (`Folder`).
  - Configurações de preço e descontos.
- **Pedido & Carrinho**: Fluxo de E-commerce.
  - `Carrinho`, `ItemCarrinho`, `Pedido`, `ItemPedido`.
  - Licenciamento (`FotoLicenca`) define o tipo de uso (Pessoal/Comercial).
- **Financeiro**:
  - `Saldo`, `Transacao`, `SolicitacaoSaque`.

## 5. Módulos e Funcionalidades Chave

### A. Autenticação & Permissões

Utiliza `Stack Auth` para gerenciar sessões. O arquivo `proxy.ts` sugere um middleware customizado para segurança (CSP, Headers) e gerenciamento de requisições. O sistema distingue claramente entre Cliente (comprador) e Fotógrafo (vendedor).

### B. Gestão de Coleções (`features/collections`)

Fotógrafos podem criar coleções, definir preços globais por coleção e organizar fotos em pastas. O upload é processado para gerar thumbnails e armazenar os originais no S3.

### C. Busca e Indexação

Suporte para busca de fotos por tags, orientação e metadados. O schema sugere planos para reconhecimento facial (`FaceIndexingStatus`), indicando uma feature avançada de busca por rosto.

### D. Segurança

- **CSP (Content Security Policy)** configurado em `proxy.ts`.
- **URLs Assinadas**: Fotos originais no S3 são privadas; o sistema deve gerar URLs assinadas ou servir via proxy para downloads pagos.

## 6. Configuração e Instalação

### Pré-requisitos

- Node.js (v20+)
- PostgreSQL (Neon)
- Chaves de API (AWS S3, MercadoPago, Stack Auth)

### Passos

1.  **Instalar dependências**:
    ```bash
    npm install
    ```
2.  **Configurar Variáveis de Ambiente**:
    Crie um arquivo `.env` com:
    - `DATABASE_URL`
    - `S3_UPLOAD_ACCESS_KEY_ID`, `S3_UPLOAD_SECRET_ACCESS_KEY`, `S3_UPLOAD_REGION`, `S3_UPLOAD_BUCKET`
    - `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY`
    - `MERCADOPAGO_ACCESS_TOKEN`
3.  **Migrar Banco de Dados**:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```
4.  **Rodar Aplicação**:
    ```bash
    npm run dev
    ```
5.  **Testes**:
    ```bash
    npm run test:e2e  # Playwright
    npm run test      # Jest
    ```

## 7. Próximos Passos Sugeridos

- **Documentar API Routes**: Detalhar os endpoints em `app/api`.
- **Refinar Server Actions**: Migrar lógica de API routes para Server Actions para melhor integração com Client Components no Next.js 16.
- **Cobertura de Testes**: Expandir testes E2E para fluxos críticos de compra, webhook do MercadoPago e saque.
- **Reconhecimento Facial**: Implementar feature de busca por rosto usando `FaceIndexingStatus` do schema.
