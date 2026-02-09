"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NavUserActions from "./NavUserActions";

export default function DashboardHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-surface-page/95 backdrop-blur-xl flex items-center justify-center"
      role="banner"
    >
      <div className="container-wide w-full flex items-center justify-between px-4 md:px-6 h-full">
        <Link
          href={isAdmin ? "/admin" : "/dashboard/fotografo"}
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="GTClicks - Ir ao dashboard"
        >
          <div className="relative h-8 w-28 md:h-9 md:w-32">
            <Image
              src="/logo.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 hidden sm:inline"
          >
            Ver site
          </Link>
          <NavUserActions />
        </div>
      </div>
    </header>
  );
}
