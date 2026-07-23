/**
 * The static (non-parameterized) public routes — single source of truth for
 * the admin SEO tab, the sitemap generator, and the prerender script's
 * static-route portion. Deliberately excludes `/admin` and the `*` 404 route.
 */
export interface StaticRoute { path: string; seoLabel: string }

export const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', seoLabel: 'Home' },
  { path: '/tools', seoLabel: 'Tools' },
  { path: '/courses', seoLabel: 'Courses' },
  { path: '/about', seoLabel: 'About' },
  { path: '/contact', seoLabel: 'Contact' },
  { path: '/blog', seoLabel: 'Blog' },
  { path: '/privacy-policy', seoLabel: 'Privacy Policy' },
  { path: '/terms', seoLabel: 'Terms of Service' },
  { path: '/refund-policy', seoLabel: 'Refund Policy' },
  { path: '/disclaimer', seoLabel: 'Disclaimer' },
];
