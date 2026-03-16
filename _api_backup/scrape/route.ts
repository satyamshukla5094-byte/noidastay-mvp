import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";
import { createClient } from "@supabase/supabase-js";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80";

const findValueFromLabel = (root: ReturnType<typeof load>, label: string): string | null => {
  const match = root(`*:contains("${label}")`).filter((_, el) => root(el).text().trim().toLowerCase().includes(label.toLowerCase())).first();
  if (!match.length) return null;
  const next = match.next().text();
  if (next) return next.trim();
  const text = match.text().trim();
  const split = text.split(/:\s*|\s+-\s+/);
  if (split.length > 1) return split.slice(1).join(":").trim();
  return null;
};

const normalizeImage = async (url: string | null): Promise<string> => {
  if (!url) return FALLBACK_IMAGE;
  if (!url.startsWith("http")) return FALLBACK_IMAGE;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return FALLBACK_IMAGE;
    return url;
  } catch {
    return FALLBACK_IMAGE;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = typeof body?.url === "string" && body.url ? body.url : "https://example.com";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch ${targetUrl}` }, { status: 500 });
    }

    const html = await response.text();
    const $ = load(html);

    const name = findValueFromLabel($, "Name") || $("h1").first().text().trim() || "NoidaStay PG";
    const priceText = findValueFromLabel($, "Price") || $("body").text().match(/₹\s*[0-9,]+/)?.[0] || "0";
    const price = Number(String(priceText).replace(/[^0-9]/g, "")) || 0;
    const sector = findValueFromLabel($, "Location") || findValueFromLabel($, "Sector") || "Alpha";
    const imageUrl = $("img").first().attr("src") || null;

    const item = {
      title: name,
      description: `Synced from ${targetUrl}`,
      price,
      sector,
      owner_id: null,
      lat: 0,
      lng: 0,
      images: [await normalizeImage(imageUrl)],
      is_verified: /verified by owner/i.test(html),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const matched = await supabase
      .from("properties")
      .select("id")
      .ilike("title", `%${name}%`)
      .eq("sector", sector)
      .limit(1)
      .single();

    let result;
    if (matched.data?.id) {
      const { data, error } = await supabase.from("properties").update(item).eq("id", matched.data.id).select("id,title,sector,price");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = { mode: "updated", record: data?.[0] };
    } else {
      const { data, error } = await supabase.from("properties").insert([item]).select("id,title,sector,price");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = { mode: "inserted", record: data?.[0] };
    }

    return NextResponse.json({ source: targetUrl, scraped: 1, result }, { status: 200 });
  } catch (error: any) {
    console.error("Scrape route error", error);
    return NextResponse.json({ error: error?.message || "Scraper failed" }, { status: 500 });
  }
}
