import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const defaultOwnerId = process.env.NEXT_PUBLIC_DEFAULT_OWNER_ID;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase env vars.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scrapeUrl = body?.url || "https://example.com";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const scraperRes = await fetch(`${appUrl}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: scrapeUrl }),
    });

    if (!scraperRes.ok) {
      const errorBody = await scraperRes.json().catch(() => ({}));
      return NextResponse.json({ error: "Scrape failed", details: errorBody }, { status: 500 });
    }

    const scraped = await scraperRes.json();
    const items = Array.isArray(scraped.items) ? scraped.items : [];
    if (!items.length) {
      return NextResponse.json({ found: 0, updated: 0, inserted: 0, details: "No scraped records" }, { status: 200 });
    }

    let inserted = 0;
    let updated = 0;
    const records: any[] = [];

    for (const item of items) {
      const sector = item.sector || item.location || "Alpha";
      const payload = {
        owner_id: defaultOwnerId || null,
        title: item.name || item.title || "NoidaStay PG",
        description: item.description || "PG listing from external sync",
        price: Number(item.price) || 0,
        lat: Number(item.lat) || 0,
        lng: Number(item.lng) || 0,
        sector,
        is_verified: Boolean(item.verified_by_owner),
        images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
        updated_at: new Date().toISOString(),
      };

      const existing = await supabase
        .from("properties")
        .select("id")
        .eq("title", payload.title)
        .eq("sector", sector)
        .limit(1)
        .single();

      if (existing.data?.id) {
        const { data, error } = await supabase.from("properties").update(payload).eq("id", existing.data.id).select("id, title, sector");
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        updated += 1;
        records.push(...(data ?? []));
      } else {
        const { data, error } = await supabase.from("properties").insert([{ ...payload, created_at: new Date().toISOString() }]).select("id, title, sector");
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        inserted += 1;
        records.push(...(data ?? []));
      }
    }

    return NextResponse.json({ found: items.length, inserted, updated, records }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Sync failed" }, { status: 500 });
  }
}
