export const siteConfig = {
  name: "GTClicks",
  description:
    "Marketplace multi-fotógrafo para vender coleções exclusivas e licenças com entrega segura.",
  navItems: [
    { href: "/busca", label: "Explorar" },
    { href: "/categorias", label: "Categorias" },
    { href: "/colecoes", label: "Coleções" },
    { href: "/meus-favoritos", label: "Favoritos" },
  ],
  footerParams: {
    platform: [
      { href: "/busca", label: "Explorar Fotos" },
      { href: "/colecoes", label: "Coleções" },
      { href: "/categorias", label: "Categorias" },
      { href: "/meus-favoritos", label: "Meus Favoritos" },
    ],
    photographers: [
      { href: "/cadastro", label: "Começar a Vender" },
      { href: "/dashboard/fotografo/colecoes", label: "Fazer Upload" },
      { href: "/dashboard/fotografo/financeiro", label: "Painel Financeiro" },
    ],
    support: [
      { href: "/faq", label: "Perguntas Frequentes" },
      { href: "/termos", label: "Termos de Uso" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/contato", label: "Fale Conosco" },
    ],
  },
  links: {
    cart: "/carrinho",
    signup: "/cadastro",
  },
};
