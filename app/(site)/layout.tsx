import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex-1 w-full pt-16 pb-24 md:pt-[76px] md:pb-0"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
