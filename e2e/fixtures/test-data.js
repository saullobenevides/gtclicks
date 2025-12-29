/**
 * Test data fixtures for Playwright E2E tests
 */

export const TEST_COLLECTIONS = {
  sportsEvent: {
    id: 'col-sports-1',
    slug: 'corrida-sao-paulo-2024',
    titulo: 'Corrida São Paulo 2024',
    descricao: 'Fotos da corrida de rua em São Paulo',
    preco: 10.0,
    fotografoId: 'foto-profile-1',
    totalFotos: 150,
  },
  wedding: {
    id: 'col-wedding-1',
    slug: 'casamento-maria-joao',
    titulo: 'Casamento Maria & João',
    descricao: 'Álbum completo do casamento',
    preco: 25.0,
    fotografoId: 'foto-profile-1',
    totalFotos: 450,
  },
};

export const TEST_PHOTOS = {
  photo1: {
    id: 'photo-1',
    titulo: 'Chegada dos Atletas',
    filename: 'IMG_001.jpg',
    url: 'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Photo+1',
    colecaoId: TEST_COLLECTIONS.sportsEvent.id,
    preco: 10.0,
    bibNumber: '1234',
  },
  photo2: {
    id: 'photo-2',
    titulo: 'Linha de Chegada',
    filename: 'IMG_002.jpg',
    url: 'https://via.placeholder.com/800x600/00FF00/FFFFFF?text=Photo+2',
    colecaoId: TEST_COLLECTIONS.sportsEvent.id,
    preco: 10.0,
    bibNumber: '5678',
  },
  photo3: {
    id: 'photo-3',
    titulo: 'Pódio',
    filename: 'IMG_003.jpg',
    url: 'https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Photo+3',
    colecaoId: TEST_COLLECTIONS.sportsEvent.id,
    preco: 10.0,
  },
};

export const TEST_ORDERS = {
  pendingOrder: {
    id: 'order-1',
    userId: 'test-buyer-1',
    total: 30.0,
    status: 'PENDENTE',
    itens: [
      { fotoId: 'photo-1', precoPago: 10.0 },
      { fotoId: 'photo-2', precoPago: 10.0 },
      { fotoId: 'photo-3', precoPago: 10.0 },
    ],
  },
  completedOrder: {
    id: 'order-2',
    userId: 'test-buyer-1',
    total: 20.0,
    status: 'PAGO',
    itens: [
      { fotoId: 'photo-1', precoPago: 10.0 },
      { fotoId: 'photo-2', precoPago: 10.0 },
    ],
  },
};

export const TEST_PHOTOGRAPHER_PROFILE = {
  incomplete: {
    userId: 'test-photographer-1',
    // Missing fields intentionally for testing
  },
  complete: {
    id: 'foto-profile-1',
    userId: 'test-photographer-1',
    username: 'fotografo_teste',
    displayName: 'Fotógrafo Teste',
    bio: 'Fotógrafo profissional especializado em eventos esportivos',
    telefone: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    pixKey: 'fotografo@test.com',
    pixType: 'EMAIL',
  },
};

/**
 * Helper to create mock API responses
 */
export function createMockResponse(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

/**
 * Helper to create collection list response
 */
export function createCollectionsListResponse(collections = [TEST_COLLECTIONS.sportsEvent]) {
  return createMockResponse({
    colecoes: collections,
    total: collections.length,
  });
}

/**
 * Helper to create photos list response
 */
export function createPhotosListResponse(photos = Object.values(TEST_PHOTOS)) {
  return createMockResponse({
    fotos: photos,
    total: photos.length,
  });
}
