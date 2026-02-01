"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useStackApp } from "@stackframe/stack";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  FolderDown,
  Camera,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
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
      fetch("/api/users/me/dashboard")
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setDashboardUrl(data.url);
          if (data.username) setUsername(data.username);
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-space-4">
        <div className="h-9 w-9 animate-pulse rounded-radius-full bg-surface-subtle" />
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    if (mobile) {
      return (
        <div className="grid grid-cols-2 gap-space-4">
          <Button variant="outline" className="w-full h-11" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button className="w-full h-11" asChild>
            <Link href="/registrar">Criar Conta</Link>
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className="px-space-5 h-9 bg-surface-subtle/40 text-text-primary hover:bg-surface-subtle border border-border-subtle backdrop-blur-sm"
        asChild
      >
        <Link href="/login">Entrar</Link>
      </Button>
    );
  }

  // Logged In State (Mobile)
  if (mobile) {
    return (
      <div className="space-y-space-2">
        <div className="flex items-center gap-space-4 px-space-4 py-space-4 bg-surface-subtle/40 rounded-radius-xl border border-border-subtle">
          <Avatar className="h-12 w-12 border border-border-subtle">
            <AvatarImage
              src={user.profileImageUrl}
              alt={user.displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-action-primary/20 text-action-primary">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-font-bold text-text-primary text-text-lg">
              {user.displayName}
            </p>
            <p className="text-text-sm text-text-muted">{user.primaryEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-1 pt-space-2">
          {username && (
            <MobileLink href={`/fotografo/${username}`} icon={User}>
              Meu Perfil Público
            </MobileLink>
          )}
          {dashboardUrl && (
            <MobileLink href={dashboardUrl} icon={LayoutDashboard}>
              Painel do Fotógrafo
            </MobileLink>
          )}
          <MobileLink href="/handler/account-settings" icon={Settings}>
            Minha Conta
          </MobileLink>
          <MobileLink href="/pedidos" icon={ShoppingBag}>
            Meus Pedidos
          </MobileLink>
          <MobileLink href="/meus-downloads" icon={FolderDown}>
            Meus Downloads
          </MobileLink>

          <button
            onClick={() => app.signOut()}
            className="flex items-center gap-space-3 w-full px-space-4 py-space-3 rounded-radius-xl text-status-error hover:bg-status-error/10 transition-colors text-left"
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
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full border border-border-subtle bg-surface-subtle/40 hover:bg-surface-subtle hover:text-text-primary focus:ring-0 focus:ring-offset-0 transition-all hover:scale-105"
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user.profileImageUrl}
              alt={user.displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-surface-elevated text-text-muted font-font-bold">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border-border-subtle bg-surface-elevated/95 p-space-2 text-text-primary shadow-shadow-lg backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="p-space-3">
          <div className="flex flex-col space-y-space-1">
            <p className="text-text-sm font-font-bold leading-none text-text-primary">
              {user.displayName}
            </p>
            <p className="text-text-xs leading-none text-text-muted truncate">
              {user.primaryEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border-subtle mx-space-2 my-space-1" />

        <div className="grid gap-space-1">
          {username && (
            <DropdownItem href={`/fotografo/${username}`} icon={User}>
              Meu Perfil Público
            </DropdownItem>
          )}
          {dashboardUrl && (
            <DropdownItem href={dashboardUrl} icon={LayoutDashboard}>
              Painel do Fotógrafo
            </DropdownItem>
          )}
          {!username && (
            <DropdownItem
              href="/cadastro"
              icon={Camera}
              className="text-action-primary focus:text-action-primary-hover"
            >
              Seja Fotógrafo
            </DropdownItem>
          )}

          <DropdownMenuSeparator className="bg-border-subtle mx-space-2 my-space-1" />

          <DropdownItem href="/handler/account-settings" icon={Settings}>
            Minha Conta
          </DropdownItem>
          <DropdownItem href="/pedidos" icon={ShoppingBag}>
            Meus Pedidos
          </DropdownItem>
          <DropdownItem href="/meus-downloads" icon={FolderDown}>
            Meus Downloads
          </DropdownItem>
        </div>

        <DropdownMenuSeparator className="bg-border-subtle mx-space-2 my-space-1" />

        <DropdownMenuItem
          onSelect={() => app.signOut()}
          className="cursor-pointer rounded-radius-md px-space-3 py-space-2 text-status-error focus:bg-status-error/10 focus:text-status-error mt-space-1 flex items-center gap-space-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-text-sm font-font-medium">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper Components for Cleaner Code
function DropdownItem({ href, icon: Icon, children, className }) {
  return (
    <DropdownMenuItem
      asChild
      className={cn(
        "cursor-pointer rounded-radius-md px-space-3 py-space-2 focus:bg-surface-subtle focus:text-text-primary flex items-center gap-space-2 text-text-secondary transition-colors",
        className
      )}
    >
      <Link href={href}>
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-text-sm font-font-medium">{children}</span>
      </Link>
    </DropdownMenuItem>
  );
}

function MobileLink({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-space-3 px-space-4 py-space-3 text-text-secondary hover:text-text-primary rounded-radius-xl hover:bg-surface-subtle/40 transition-colors"
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </Link>
  );
}
