export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/checkout/', '/api/'],
    },
    sitemap: 'https://www.gtclicks.com/sitemap.xml',
  }
}
