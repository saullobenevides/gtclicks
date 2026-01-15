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
import { useUser, useStackApp } from '@stackframe/stack'; 
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { User, LogOut, LayoutDashboard, Settings, ShoppingBag, FolderDown, Camera } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'U';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase().slice(0, 2);
}

export default function NavUserActions({ mobile = false }) {
  const user = useUser();
  const app = useStackApp();
  const [dashboardUrl, setDashboardUrl] = useState(null);
  const [username, setUsername] = useState(null);

  const isLoading = user === undefined;

  useEffect(() => {
    if (user) {
      fetch('/api/users/me/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setDashboardUrl(data.url);
          if (data.username) setUsername(data.username);
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    if (mobile) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 text-white" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button className="w-full h-12 bg-white text-black hover:bg-gray-200" asChild>
            <Link href="/login">Criar Conta</Link>
          </Button>
        </div>
      );
    }

    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="rounded-full px-5 h-9 bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all border border-white/5 backdrop-blur-sm" 
        asChild
      >
        <Link href="/login">Entrar</Link>
      </Button>
    );
  }

  // Logged In State (Mobile)
  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-xl border border-white/5">
          <Avatar className="h-12 w-12 border border-white/10">
            <AvatarImage src={user.profileImageUrl} alt={user.displayName} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary">{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-bold text-white text-lg">{user.displayName}</p>
            <p className="text-sm text-zinc-400">{user.primaryEmail}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1 pt-2">
            {username && (
                <MobileLink href={`/fotografo/${username}`} icon={User}>Meu Perfil Público</MobileLink>
            )}
            {dashboardUrl && (
                <MobileLink href={dashboardUrl} icon={LayoutDashboard}>Painel do Fotógrafo</MobileLink>
            )}
            <MobileLink href="/handler/account-settings" icon={Settings}>Minha Conta</MobileLink>
            <MobileLink href="/pedidos" icon={ShoppingBag}>Meus Pedidos</MobileLink>
            <MobileLink href="/meus-downloads" icon={FolderDown}>Meus Downloads</MobileLink>
            
            <button 
                onClick={() => app.signOut()}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
                <LogOut className="h-5 w-5" />
                Sair
            </button>
        </div>
      </div>
    );
  }

  // Logged In State (Desktop)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white focus:ring-0 focus:ring-offset-0 transition-all hover:scale-105">
          <Avatar className="h-full w-full">
            <AvatarImage src={user.profileImageUrl} alt={user.displayName} className="object-cover" />
            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 border-zinc-800 bg-zinc-950/95 p-2 text-zinc-100 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-white">{user.displayName}</p>
            <p className="text-xs leading-none text-zinc-500 truncate">
              {user.primaryEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10 mx-2 my-1" />
        
        <div className="grid gap-1">
            {username && (
              <DropdownItem href={`/fotografo/${username}`} icon={User}>Meu Perfil Público</DropdownItem>
            )}
            {dashboardUrl && (
              <DropdownItem href={dashboardUrl} icon={LayoutDashboard}>Painel do Fotógrafo</DropdownItem>
            )}
            {!username && (
               <DropdownItem href="/cadastro" icon={Camera} className="text-indigo-400 focus:text-indigo-300">
                 Seja Fotógrafo
               </DropdownItem>
            )}
            
            <DropdownMenuSeparator className="bg-white/10 mx-2 my-1" />
            
            <DropdownItem href="/handler/account-settings" icon={Settings}>Minha Conta</DropdownItem>
            <DropdownItem href="/pedidos" icon={ShoppingBag}>Meus Pedidos</DropdownItem>
            <DropdownItem href="/meus-downloads" icon={FolderDown}>Meus Downloads</DropdownItem>
        </div>

        <DropdownMenuSeparator className="bg-white/10 mx-2 my-1" />
        
        <DropdownMenuItem 
          onSelect={() => app.signOut()} 
          className="cursor-pointer rounded-md px-3 py-2 text-red-400 focus:bg-red-500/10 focus:text-red-300 mt-1 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper Components for Cleaner Code
function DropdownItem({ href, icon: Icon, children, className }) {
    return (
        <DropdownMenuItem asChild className={cn("cursor-pointer rounded-md px-3 py-2 focus:bg-white/10 focus:text-white flex items-center gap-2 text-zinc-400", className)}>
            <Link href={href}>
                {Icon && <Icon className="h-4 w-4" />}
                <span className="text-sm font-medium">{children}</span>
            </Link>
        </DropdownMenuItem>
    )
}

function MobileLink({ href, icon: Icon, children }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
            {Icon && <Icon className="h-5 w-5" />}
            {children}
        </Link>
    )
}
