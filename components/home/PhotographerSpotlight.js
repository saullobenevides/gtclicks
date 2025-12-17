import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PhotographerSpotlight({ photographers = [] }) {
  if (!photographers || photographers.length === 0) return null;

  return (
    <section className="bg-white/5 py-24 border-y border-white/5">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Criadores
          </h2>
          <p className="max-w-2xl text-lg text-gray-400">
            Conheça os talentos por trás das lentes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {photographers.map((photographer) => (
            <Link
              key={photographer.username}
              href={`/fotografo/${photographer.username}`}
              className="group block"
            >
              <Card className="glass-panel flex h-full flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-white/10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                  <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-primary transition-colors relative">
                    <AvatarImage
                      src={photographer.avatarUrl}
                      alt={photographer.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white/10 text-white text-xl">
                      {photographer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <CardHeader className="p-0">
                  <CardTitle className="text-xl font-bold text-white mb-1">
                    {photographer.name}
                  </CardTitle>
                  <p className="text-sm text-primary font-medium uppercase tracking-wider">
                    {photographer.city}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
