import Link from "next/link";

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-white/10 bg-black/20 py-4 mt-auto"
      role="contentinfo"
    >
      <div className="container-wide px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© {currentYear} GTClicks</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white transition-colors">
            Ver site
          </Link>
          <Link href="/termos" className="hover:text-white transition-colors">
            Termos
          </Link>
          <Link
            href="/privacidade"
            className="hover:text-white transition-colors"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
