export const siteConfig = {
  name: "GTClicks",
  description:
    "Marketplace multi-fotógrafo para vender coleções exclusivas e licenças com entrega segura.",
  navItems: [
    { href: "/busca", label: "Explorar" },
    { href: "/cadastro", label: "Venda suas Fotos" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/faq", label: "Dúvidas" },
  ],
  footerParams: {
    platform: [
      { href: "/busca", label: "Explorar Fotos" },
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
