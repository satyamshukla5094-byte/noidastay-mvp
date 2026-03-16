import { createClient } from "@supabase/supabase-js";
import { AREA_SLUGS } from "../constants/areas";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noidastay.com';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/search',
    '/blog',
    '/list-my-pg',
    '/verify',
  ];

  // 2. Dynamic Area Routes
  const areaRoutes = AREA_SLUGS.map((area: any) => `/pg-near/${area.slug}`);

  // 3. Dynamic Property Routes
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("visibility_status", "public");

  const propertyRoutes = (properties || []).map((p: any) => `/property/${p.id}`);

  const allRoutes = [...staticRoutes, ...areaRoutes, ...propertyRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(route => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
</urlset>`;

  return sitemap;
}
