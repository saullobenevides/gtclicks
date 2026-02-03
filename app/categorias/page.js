import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { PageSection, SectionHeader } from "@/components/shared/layout";

// Imagens Unsplash verificadas - uma para cada categoria
const REAL_IMAGES = {
  // Nature / Outdoor / Adventure
  nature: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  water: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // praia/mar
  forest: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // natureza

  // Urban / City / Lifestyle
  urban: "https://images.unsplash.com/photo-1514565131-fce0801e5785",
  architecture: "https://images.unsplash.com/photo-1486325212027-8081e485255e",
  abstract: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",
  neon: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",
  motorcycle: "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
  car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
  drone: "https://images.unsplash.com/photo-1473968512647-3e447244af8f",
  skate: "https://images.unsplash.com/photo-1561214115-f2f134cc4912",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",

  // Sports Specific
  soccer: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", // campo futebol
  basketball:
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80",
  fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  cycling: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d", // mountain bike
  running: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", // fitness/corrida
  volleyball:
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
  tennis:
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
  surf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
  martial:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  golf: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
  horse: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80",
  paintball:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  pet: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",

  // Events / People
  event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  crowd:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
  portrait: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  wedding:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  fashion:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  family:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
  dance:
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80",
};

const CATEGORY_IMAGES = {
  // --- Esportes com Bola/Campo ---
  Futebol: REAL_IMAGES.soccer,
  Futsal:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  Futevôlei: REAL_IMAGES.beach,
  "Futebol de Areia":
    "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&q=80",
  Altinha: REAL_IMAGES.beach,
  "Flag Football":
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018", // campo
  "Futebol Americano":
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
  Rugby:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  Baseball:
    "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&q=80",
  Vôlei: REAL_IMAGES.volleyball,
  Basquete: REAL_IMAGES.basketball,
  Handebol: REAL_IMAGES.basketball, // quadra coberta

  // --- Raquetes ---
  Tênis: REAL_IMAGES.tennis,
  "Beach Tennis": REAL_IMAGES.beach,
  Padel: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8", // tênis/quadra
  Pickeball:
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
  Pickleball:
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
  Badminton:
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  "Tênis de Mesa":
    "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80",

  // --- Fitness / Ginástica ---
  Crossfit: REAL_IMAGES.fitness,
  Treinos:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  Ginástica:
    "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80",
  "Treinamento Funcional": REAL_IMAGES.fitness,
  Hyrox:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",

  // --- Outdoor / Aventura / Água ---
  Corrida: REAL_IMAGES.running,
  Ciclismo: REAL_IMAGES.cycling,
  "Mountain Bike":
    "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80",
  Triathlon:
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
  Natação: REAL_IMAGES.swimming,
  Surf: REAL_IMAGES.surf,
  "Kite Surf":
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
  Skimboard: REAL_IMAGES.water,
  Mergulho:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  Subaquática:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  "Canoa Havaiana":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // praia/remo
  Iatismo: REAL_IMAGES.water,
  Pescaria: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // praia/água
  Trilhas: REAL_IMAGES.mountain,
  "Escalada Trilhas":
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
  "Voo Livre":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  Natureza: REAL_IMAGES.forest,
  Paraquedismo:
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",

  // --- Lutas ---
  "Artes Marciais": REAL_IMAGES.martial,
  "Jiu-jítsu": REAL_IMAGES.martial,
  Judô: REAL_IMAGES.martial,
  "Muay Thai": REAL_IMAGES.martial,

  // --- Motor / Velocidade ---
  Motociclismo: REAL_IMAGES.motorcycle,
  Motocross:
    "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80",
  Automotiva: REAL_IMAGES.car,
  Kart: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  Arrancada: REAL_IMAGES.car,
  Offroad: REAL_IMAGES.mountain,
  Grau: REAL_IMAGES.motorcycle,

  // --- Eventos / Social ---
  Eventos: REAL_IMAGES.event,
  Corporativo: REAL_IMAGES.event,
  Formaturas: REAL_IMAGES.crowd,
  Festas: REAL_IMAGES.crowd,
  Casamento: REAL_IMAGES.wedding,
  Batizado: REAL_IMAGES.family,
  "Teatro e Musicais": REAL_IMAGES.crowd,
  "Evento Religioso": REAL_IMAGES.event,
  Dança: REAL_IMAGES.dance,
  Ensaios: REAL_IMAGES.portrait,
  Família: REAL_IMAGES.family,
  Moda: REAL_IMAGES.fashion,
  Pets: REAL_IMAGES.pet,

  // --- Outros ---
  Hipismo: REAL_IMAGES.horse,
  Equestre: REAL_IMAGES.horse,
  Rodeio: REAL_IMAGES.horse,
  Skate: REAL_IMAGES.skate,
  Patinação:
    "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80",
  Paintball: REAL_IMAGES.paintball,
  Airsoft:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  Drones: REAL_IMAGES.drone,
  Imóveis: REAL_IMAGES.architecture,
  Jornalística: REAL_IMAGES.urban,
  Ecommerce: REAL_IMAGES.urban,
  Alimentos: REAL_IMAGES.food,
  Golfe: REAL_IMAGES.golf,
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
