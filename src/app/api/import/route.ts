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
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected JSON array" }, { status: 400 });
    }
    if (!body.length) {
      return NextResponse.json({ error: "Property array is empty" }, { status: 400 });
    }

    const results: any[] = [];
    let inserted = 0;
    let updated = 0;

    for (const item of body) {
      const sector = item.sector || (item.localities && item.localities[0]) || "Alpha";
      const payload = {
        owner_id: item.owner_id || defaultOwnerId || null,
        title: item.title || item.name || "NoidaStay PG",
        description: item.description || "Bulk imported PG listing",
        price: Number(item.price) || 0,
        lat: Number(item.lat) || 0,
        lng: Number(item.lng) || 0,
        sector,
        is_verified: Boolean(item.verified_by_owner),
        images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
        updated_at: new Date().toISOString(),
      };

      const lookup = await supabase
        .from("properties")
        .select("id")
        .eq("title", payload.title)
        .eq("sector", sector)
        .limit(1)
        .single();

      if (lookup.error && lookup.error.code !== "PGRST116") {
        return NextResponse.json({ error: lookup.error.message }, { status: 500 });
      }

      if (lookup.data?.id) {
        const { data, error } = await supabase.from("properties").update(payload).eq("id", lookup.data.id).select("id, title, sector, price");
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        updated += 1;
        results.push(...(data ?? []));
      } else {
        const row = {
          ...payload,
          owner_id: payload.owner_id,
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from("properties").insert([row]).select("id, title, sector, price");
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        inserted += 1;
        results.push(...(data ?? []));
      }
    }

    return NextResponse.json({ inserted, updated, records: results }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
