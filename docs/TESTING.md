# Guia de Testes - GTClicks

## Visão Geral

O projeto GTClicks utiliza uma abordagem abrangente de testes automatizados com três níveis principais:

1. **Testes Unitários** - Jest + React Testing Library
2. **Testes de API** - Jest com node-mocks-http
3. **Testes E2E** - Playwright

## Configuração

### Dependências Instaladas

- `jest` - Test runner
- `@testing-library/react` - Testes de componentes React
- `@testing-library/jest-dom` - Matchers customizados para DOM
- `jest-environment-jsdom` - Ambiente de browser simulado
- `@playwright/test` - Framework de testes E2E
- `node-mocks-http` - Mocks de requisições HTTP

### Arquivos de Configuração

- `jest.config.js` - Configuração do Jest
- `jest.setup.js` - Setup global para testes (mocks comuns)
- `playwright.config.js` - Configuração do Playwright

## Comandos de Teste

### Testes Unitários e de API

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm test -- --watch

# Executar testes específicos
npm test -- PhotographerProfileForm

# Executar apenas testes de API
npm test -- __tests__/api

# Executar apenas testes de componentes
npm test -- __tests__/components

# Executar com cobertura
npm test -- --coverage
```

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com interface visual
npm run test:e2e:ui

# Executar em modo headed (ver navegador)
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug

# Ver relatório da última execução
npm run test:e2e:report
```

## Estrutura de Pastas

```
gtclicks/
├── __tests__/
│   ├── api/                      # Testes de rotas de API
│   │   ├── checkout.test.js
│   │   ├── cart_sync.test.js
│   │   └── ...
│   ├── components/               # Testes de componentes React
│   │   ├── PhotographerProfileForm.test.jsx
│   │   └── ...
│   └── lib/                      # Testes de utilidades
│       ├── pricing.test.js
│       └── ...
│
├── e2e/                          # Testes End-to-End
│   ├── fixtures/                 # Helpers e dados de teste
│   │   ├── auth.js              # Autenticação mock
│   │   └── test-data.js         # Dados de teste reutilizáveis
│   ├── critical-flows/          # Fluxos críticos de negócio
│   │   ├── complete-purchase.spec.js
│   │   └── photographer-onboarding.spec.js
│   ├── features/                # Testes de features específicas
│   │   └── facial-recognition.spec.js
│   ├── home.spec.js             # Testes da home
│   ├── cart.spec.js             # Testes do carrinho
│   └── dashboard.spec.js        # Testes do dashboard
│
├── jest.config.js
├── jest.setup.js
└── playwright.config.js
```

## Escrevendo Testes

### Testes de Componentes React

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testes de API

```javascript
import { GET } from '@/app/api/myroute/route';
import { NextRequest } from 'next/server';

describe('GET /api/myroute', () => {
  test('returns data successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/myroute');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
  });
});
```

### Testes E2E

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GTClicks/);
    
    await page.click('text=Button');
    await expect(page).toHaveURL(/success/);
  });
});
```

### Usando Fixtures de Autenticação

```javascript
import { test, expect } from '../fixtures/auth.js';

test.describe('Protected Feature', () => {
  test('as photographer', async ({ page, authenticatedAsPhotographer }) => {
    await page.goto('/dashboard');
    // User is automatically authenticated
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
```

## Padrões e Convenções

### Nomenclatura

- Arquivos de teste: `*.test.js` ou `*.spec.js`
- Componentes React: `*.test.jsx`
- Describe blocks: Use o nome do componente ou feature
- Test names: Devem descrever o comportamento esperado

### Mocks

- Mocks globais estão em `jest.setup.js`
- Mocks específicos devem ser criados no início de cada arquivo de teste
- Sempre limpe mocks com `jest.clearAllMocks()` em `beforeEach`

### Seletores

Priorize seletores nesta ordem:
1. `getByRole` - Melhor para acessibilidade
2. `getByLabelText` - Bom para formulários
3. `getByPlaceholderText` - Campos sem label
4. `getByText` - Conteúdo visível
5. `getByTestId` - Último recurso

### Async/Await

Use `waitFor` para operações assíncronas:

```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Debugging

### Testes Unitários

```javascript
// Ver renderização atual
screen.debug();

// Ver elemento específico
screen.debug(screen.getByRole('button'));

// Executar teste específico em modo watch
npm test -- --watch PhotographerProfileForm
```

### Testes E2E

```bash
# Modo debug interativo
npm run test:e2e:debug

# Executar com navegador visível
npm run test:e2e:headed

# Ver traces de execução
npm run test:e2e:report
```

## Cobertura de Testes

### Gerar Relatório de Cobertura

```bash
npm test -- --coverage
```

### Visualizar Cobertura

Após executar o comando acima, abra:
```
coverage/lcov-report/index.html
```

### Metas de Cobertura

- **Statements**: \u003e 80%
- **Branches**: \u003e 75%
- **Functions**: \u003e 80%
- **Lines**: \u003e 80%

## CI/CD Integration

### GitHub Actions (exemplo)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npx playwright install
      - run: npm run test:e2e
```

## Boas Práticas

1. **Testes Isolados**: Cada teste deve ser independente
2. **Setup/Teardown**: Use `beforeEach` e `afterEach` para resetar estado
3. **Evite Waits Fixos**: Use `waitFor` com condições específicas
4. **Nomes Descritivos**: Testes devem ser auto-documentados
5. **Teste Comportamento**: Não teste detalhes de implementação
6. **Mock APIs Externa**: Sempre mocke chamadas externas
7. **Teste Casos de Erro**: Não teste apenas o happy path

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpe cache do Jest
npm test -- --clearCache

# Reconfigure se necessário
npm install
```

### Playwright: "Browser not found"

```bash
# Reinstale browsers
npx playwright install
```

### Testes Flaky

- Use `waitFor` com timeouts adequados
- Evite `waitForTimeout` fixos
- Verifique condições de corrida em APIs mockadas

## Recursos Adicionais

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Suporte

Para questões sobre testes:
1. Verifique a documentação acima
2. Consulte testes existentes como exemplos
3. Abra uma issue no repositório
