'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useUser, useStackApp } from '@stackframe/stack'; // Keep useStackApp
import { useState, useEffect } from 'react';

function getInitials(name) {
  if (!name) return 'U';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase().slice(0, 2);
}

export default function NavUserActions() {
  const user = useUser(); // Get user directly
  const app = useStackApp(); // Get app instance for signOut
  const [dashboardUrl, setDashboardUrl] = useState(null);
  const [username, setUsername] = useState(null);

  const isLoading = user === undefined; // Infer loading state

  useEffect(() => {
    if (user) {
      fetch('/api/users/me/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setDashboardUrl(data.url);
          }
          if (data.username) {
            setUsername(data.username);
          }
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!user) { // user is null here if not logged in
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Criar conta</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white focus:ring-0 focus:ring-offset-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 bg-black/80 p-2 text-white shadow-2xl backdrop-blur-xl">
          <DropdownMenuLabel className="p-4">
            <div className="flex flex-col space-y-2">
              <p className="text-base font-bold leading-none text-white">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="p-1">
            {username && (
              <DropdownMenuItem asChild className="cursor-pointer rounded-md p-3 focus:bg-white/10 focus:text-white">
                <Link href={`/fotografo/${username}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium">Meu Perfil Público</span>
                </Link>
              </DropdownMenuItem>
            )}
            {dashboardUrl && (
              <DropdownMenuItem asChild className="cursor-pointer rounded-md p-3 focus:bg-white/10 focus:text-white">
                <Link href={dashboardUrl} className="flex items-center gap-2">
                  <span className="text-sm font-medium">Meu Painel</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer rounded-md p-3 focus:bg-white/10 focus:text-white">
              <Link href="/handler/account-settings" className="flex items-center gap-2">
                <span className="text-sm font-medium">Minha Conta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-md p-3 focus:bg-white/10 focus:text-white">
              <Link href="/meus-downloads" className="flex items-center gap-2">
                <span className="text-sm font-medium">Meus Downloads</span>
              </Link>
            </DropdownMenuItem>
            {!username && (
              <DropdownMenuItem asChild className="cursor-pointer rounded-md p-3 focus:bg-white/10 focus:text-white">
                <Link href="/cadastro" className="flex items-center gap-2">
                  <span className="text-sm font-medium">Seja Fotógrafo</span>
                </Link>
              </DropdownMenuItem>
            )}
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="p-1">
            <DropdownMenuItem 
              onSelect={() => app.signOut()} 
              className="cursor-pointer rounded-md p-3 text-red-400 focus:bg-red-500/10 focus:text-red-400"
            >
              <span className="text-sm font-medium">Sair</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
