import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { PageSection, SectionHeader } from "@/components/shared/layout";

// Real, verified Unsplash images to avoid 404s
const REAL_IMAGES = {
  // Nature / Outdoor / Adventure
  nature: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  water: "https://images.unsplash.com/photo-1534234828563-025816b30368", // Iatismo/Sailing

  // Urban / City / Lifestyle
  urban: "https://images.unsplash.com/photo-1514565131-fce0801e5785",
  architecture: "https://images.unsplash.com/photo-1486325212027-8081e485255e",
  abstract: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853", // Using neon as abstract fallback or similar
  neon: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",

  // Sports Specific (Verified from Showcase/Seed or known Staples)
  soccer:
    "https://images.unsplash.com/photo-1579952363873-27f3bde9beaa?w=800&q=80", // Field
  basketball:
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80", // Court
  fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", // Gym
  cycling:
    "https://images.unsplash.com/photo-1534787037060-18a507787f77?w=800&q=80", // Bike
  running:
    "https://images.unsplash.com/photo-1552674605-46d5c496db56?w=800&q=80", // Track

  // Events / People
  event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", // Corporate/Tech
  crowd:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80", // Party/Concert
  portrait: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", // Portrait/Fashion
};

const CATEGORY_IMAGES = {
  // --- Esportes com Bola/Campo ---
  Futebol: REAL_IMAGES.soccer,
  Futsal: REAL_IMAGES.soccer, // Field generic
  Futevôlei: REAL_IMAGES.beach, // Beach context
  "Futebol de Areia": REAL_IMAGES.beach,
  Altinha: REAL_IMAGES.beach,
  "Flag Football": REAL_IMAGES.soccer, // Field generic
  "Futebol Americano": REAL_IMAGES.soccer, // Field generic
  Rugby: REAL_IMAGES.soccer, // Field generic
  Baseball: REAL_IMAGES.soccer, // Field generic
  Vôlei: REAL_IMAGES.beach, // Court/Beach
  Basquete: REAL_IMAGES.basketball,
  Handebol: REAL_IMAGES.basketball, // Indoor court

  // --- Raquetes ---
  Tênis: REAL_IMAGES.basketball, // Court surface
  "Beach Tennis": REAL_IMAGES.beach,
  Padel: REAL_IMAGES.basketball, // Court
  Pickeball: REAL_IMAGES.basketball,
  Pickleball: REAL_IMAGES.basketball,
  Badminton: REAL_IMAGES.basketball,
  "Tênis de Mesa": REAL_IMAGES.fitness, // Indoor

  // --- Fitness / Ginástica ---
  Crossfit: REAL_IMAGES.fitness,
  Treinos: REAL_IMAGES.fitness,
  Ginástica: REAL_IMAGES.fitness,
  "Treinamento Funcional": REAL_IMAGES.fitness,
  Hyrox: REAL_IMAGES.fitness,

  // --- Outdoor / Aventura / Água ---
  Corrida: REAL_IMAGES.running,
  Ciclismo: REAL_IMAGES.cycling,
  "Mountain Bike": REAL_IMAGES.cycling,
  Triathlon: REAL_IMAGES.running,
  Natação: REAL_IMAGES.water,
  Surf: REAL_IMAGES.water,
  "Kite Surf": REAL_IMAGES.water,
  Skimboard: REAL_IMAGES.water,
  Mergulho: REAL_IMAGES.water,
  Subaquática: REAL_IMAGES.water,
  "Canoa Havaiana": REAL_IMAGES.water,
  Iatismo: REAL_IMAGES.water,
  Pescaria: REAL_IMAGES.water,
  Trilhas: REAL_IMAGES.mountain,
  "Escalada Trilhas": REAL_IMAGES.mountain,
  "Voo Livre": REAL_IMAGES.mountain,
  Natureza: REAL_IMAGES.nature,
  Paraquedismo: REAL_IMAGES.mountain,

  // --- Lutas ---
  "Artes Marciais": REAL_IMAGES.fitness, // Gym context
  "Jiu-jítsu": REAL_IMAGES.fitness,
  Judô: REAL_IMAGES.fitness,
  "Muay Thai": REAL_IMAGES.fitness,

  // --- Motor / Velocidade ---
  Motociclismo: REAL_IMAGES.urban,
  Motocross: REAL_IMAGES.mountain,
  Automotiva: REAL_IMAGES.urban,
  Kart: REAL_IMAGES.urban,
  Arrancada: REAL_IMAGES.urban,
  Offroad: REAL_IMAGES.mountain,

  // --- Eventos / Social ---
  Eventos: REAL_IMAGES.event,
  Corporativo: REAL_IMAGES.event,
  Formaturas: REAL_IMAGES.crowd,
  Festas: REAL_IMAGES.crowd,
  Casamento: REAL_IMAGES.event,
  Batizado: REAL_IMAGES.event,
  "Teatro e Musicais": REAL_IMAGES.crowd,
  "Evento Religioso": REAL_IMAGES.event,
  Dança: REAL_IMAGES.crowd,
  Ensaios: REAL_IMAGES.portrait,
  Família: REAL_IMAGES.portrait,
  Moda: REAL_IMAGES.portrait,
  Pets: REAL_IMAGES.nature,

  // --- Outros ---
  Hipismo: REAL_IMAGES.nature,
  Equestre: REAL_IMAGES.nature,
  Rodeio: REAL_IMAGES.nature,
  Skate: REAL_IMAGES.urban,
  Patinação: REAL_IMAGES.urban,
  Paintball: REAL_IMAGES.mountain,
  Airsoft: REAL_IMAGES.mountain,
  Drones: REAL_IMAGES.urban,
  Imóveis: REAL_IMAGES.architecture,
  Jornalística: REAL_IMAGES.urban,
  Ecommerce: REAL_IMAGES.urban,
  Alimentos: REAL_IMAGES.event, // Social
  Golfe: REAL_IMAGES.nature,
  Esportes: REAL_IMAGES.fitness,
  Turismo: REAL_IMAGES.beach,
  Passeio: REAL_IMAGES.nature,
  Outros: REAL_IMAGES.abstract,
  Default: REAL_IMAGES.abstract,
};

const getCategoryImage = (category) => {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;
};

export default function CategoriesPage() {
  return (
    <PageSection variant="default" containerWide>
      <SectionHeader
        isLanding
        badge="Categorias"
        title="Explore por temas"
        description="Navegue por nossas categorias selecionadas e encontre exatamente o que você procura para o seu projeto."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CATEGORIES.map((category, index) => (
          <Link
            key={category}
            href={`/busca?categoria=${category}`}
            className="group relative border-0 rounded-xl overflow-hidden min-h-[180px] sm:min-h-[220px] flex items-end shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 active:scale-[0.99] touch-manipulation"
            aria-label={`Explorar categoria ${category}`}
          >
            {/* Background Image */}
            <Image
              src={getCategoryImage(category)}
              alt={category}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 8}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10 p-6 w-full transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                {category}
              </h2>

              <div className="flex items-center gap-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                <span className="text-primary font-bold text-sm tracking-widest uppercase">
                  Ver coleção
                </span>
                <span className="text-primary transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}
