export const sampleCollections = [
  {
    id: "sample-col-1",
    nome: "Brumas Amazônicas",
    slug: "brumas-amazonicas",
    descricao: "Texturas orgânicas e atmosfera misteriosa para editoriais e docs.",
    capaUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=compress&fit=crop&w=900&q=80",
    fotografo: {
      username: "atmosfera",
      name: "Caio Freitas",
      cidade: "Manaus, AM",
    },
    fotos: [
      { id: "sample-photo-1", titulo: "Linha Azul", orientacao: "Horizontal" },
      { id: "sample-photo-2", titulo: "Neon Rosa", orientacao: "Vertical" },
    ],
  },
  {
    id: "sample-col-2",
    nome: "Arquitetura Brutalista",
    slug: "arquitetura-brutalista",
    descricao: "Ângulos fortes e concreto minimalista para campanhas urbanas.",
    capaUrl:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=compress&fit=crop&w=900&q=80",
    fotografo: {
      username: "luzurbana",
      name: "Marina Levy",
      cidade: "São Paulo, SP",
    },
    fotos: [
      { id: "sample-photo-3", titulo: "Concreto Vivo", orientacao: "Horizontal" },
      { id: "sample-photo-4", titulo: "Ângulos Paralelos", orientacao: "Vertical" },
    ],
  },
];

export const samplePhotographers = [
  {
    username: "luzurbana",
    name: "Marina Levy",
    cidade: "São Paulo, SP",
    bio: "Fotógrafa editorial apaixonada por luzes neon e texturas urbanas.",
    colecoesPublicadas: 4,
    downloads: 1820,
    specialties: ["editorial", "urbano"],
  },
  {
    username: "atmosfera",
    name: "Caio Freitas",
    cidade: "Manaus, AM",
    bio: "Explora neblinas amazônicas para criar fotos etéreas.",
    colecoesPublicadas: 3,
    downloads: 980,
    specialties: ["natureza", "textura"],
  },
];

export const sampleHighlights = [
  {
    title: "Licenças flexíveis",
    body: "Escolha entre uso editorial, comercial ou exclusividade sob medida.",
  },
  {
    title: "Uploads seguros",
    body: "Previews públicos e arquivos originais protegidos até a compra.",
  },
  {
    title: "Suporte humano",
    body: "Nossa equipe ajuda com precificação, contratos e marketing.",
  },
];

export const samplePhoto = {
  id: "sample-photo-1",
  titulo: "Linha Azul",
  orientacao: "Horizontal",
  fotografo: { name: "Marina Levy" },
  descricao: "Retrato neon perfeito para campanhas de moda.",
  tags: ["neon", "editorial"],
  licencas: [
    { id: "sample-lic-1", nome: "Editorial", descricao: "Para revistas, blogs e redes.", preco: 89 },
    { id: "sample-lic-2", nome: "Comercial", descricao: "Para anúncios e embalagens.", preco: 249 },
  ],
};

export const sampleDownloads = [
  {
    itemId: "sample-download-1",
    fotoId: "sample-photo-1",
    titulo: "Linha Azul",
    licenca: "Editorial",
    expiresAt: "2025-01-30",
  },
];
