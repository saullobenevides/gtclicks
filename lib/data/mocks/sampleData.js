export const sampleCollections = [
  {
    id: "sample-col-1",
    nome: "Brumas Amazônicas",
    slug: "brumas-amazonicas",
    cidade: "Manaus, AM",
    dataInicio: new Date("2025-01-15"),
    dataFim: new Date("2025-01-17"),
    descricao:
      "Texturas orgânicas e atmosfera misteriosa para editoriais e docs.",
    capaUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=compress&fit=crop&w=900&q=80",
    fotografo: {
      username: "atmosfera",
      name: "Caio Freitas",
      cidade: "Manaus, AM",
    },
    fotos: [
      {
        id: "sample-photo-1",
        titulo: "Linha Azul",
        orientacao: "Horizontal",
        previewUrl:
          "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
      },
      {
        id: "sample-photo-2",
        titulo: "Neon Rosa",
        orientacao: "Vertical",
        previewUrl:
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
      },
    ],
  },
  {
    id: "sample-col-2",
    nome: "Arquitetura Brutalista",
    slug: "arquitetura-brutalista",
    cidade: "São Paulo, SP",
    dataInicio: new Date("2025-02-01"),
    descricao: "Ângulos fortes e concreto minimalista para campanhas urbanas.",
    capaUrl:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=compress&fit=crop&w=900&q=80",
    fotografo: {
      username: "luzurbana",
      name: "Marina Levy",
      cidade: "São Paulo, SP",
    },
    fotos: [
      {
        id: "sample-photo-3",
        titulo: "Concreto Vivo",
        orientacao: "Horizontal",
        previewUrl:
          "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      },
      {
        id: "sample-photo-4",
        titulo: "Ângulos Paralelos",
        orientacao: "Vertical",
        previewUrl:
          "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80",
      },
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
    title: "Encontre sua foto fácil",
    body: "Não perca tempo rolando milhares de fotos. Filtre pelo horário do seu jogo ou pela data do evento e ache seu clique em segundos.",
  },
  {
    title: "Entrega Imediata",
    body: "Gostou? Comprou, baixou. Receba o arquivo original em alta resolução automaticamente logo após o pagamento.",
  },
  {
    title: "Para Fotógrafos",
    body: "Monetize seus eventos com facilidade. Upload em lote, link de vendas automático e recebimento rápido via PIX.",
  },
];

export const samplePhoto = {
  id: "sample-photo-1",
  titulo: "Linha Azul",
  orientacao: "Horizontal",
  fotografo: { name: "Marina Levy" },
  descricao: "Retrato neon perfeito para campanhas de moda.",
  tags: ["neon", "editorial"],
  previewUrl:
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
  width: 6000,
  height: 4000,
  camera: "Canon EOS R5",
  lens: "85mm f/1.2",
  focalLength: "85mm",
  iso: 100,
  shutterSpeed: "1/200",
  aperture: "f/1.2",
  licencas: [
    {
      id: "sample-lic-1",
      nome: "Editorial",
      descricao: "Para revistas, blogs e redes.",
      preco: 89,
    },
    {
      id: "sample-lic-2",
      nome: "Comercial",
      descricao: "Para anúncios e embalagens.",
      preco: 249,
    },
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
