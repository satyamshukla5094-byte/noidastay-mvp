import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import axios from "axios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { optimizeAndUploadImage } from "@/lib/images";

async function geocodeAddress(address: string) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address + ", Greater Noida, India",
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "NoidaStay-Scraper/1.0",
      },
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return { lat: 28.4744, lng: 77.5040 }; // Default to Knowledge Park 2
}

function extractCategory(text: string): "Boys" | "Girls" | "Co-ed" {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("girls") || lowerText.includes("female")) return "Girls";
  if (lowerText.includes("boys") || lowerText.includes("male")) return "Boys";
  return "Co-ed";
}

export async function POST(req: NextRequest) {
  try {
    const { url, parentGuestRoom } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Mock extraction logic - in a real scenario, selectors would be target-specific
    const propertyName = $("h1").first().text().trim() || "NoidaStay Verified PG";
    const address = $(".address, .location").first().text().trim() || "Knowledge Park, Greater Noida";
    const priceText = $(".price").first().text().trim() || "0";
    const price = parseInt(priceText.replace(/[^0-9]/g, "")) || 5000;
    
    const amenities: string[] = [];
    $("[class*='amenity'], [class*='feature']").each((_, el) => {
      amenities.push($(el).text().trim());
    });

    const images: string[] = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http") && i < 5) images.push(src);
    });

    const description = $("p, .description").text().trim();
    const category = extractCategory(propertyName + " " + description);
    const { lat, lng } = await geocodeAddress(address);

    const propertyData: any = {
      title: propertyName,
      description: description,
      price: price,
      lat: lat,
      lng: lng,
      sector: address,
      amenities: amenities,
      images: images,
      is_verified: true,
      owner_id: process.env.NEXT_PUBLIC_DEFAULT_OWNER_ID,
      category: category,
      parent_guest_room: parentGuestRoom || false,
      scraped_url: url,
      updated_at: new Date().toISOString(),
    };

    // Upsert Logic
    const { data, error } = await supabase
      .from("properties")
      .upsert(
        [propertyData],
        { onConflict: "scraped_url" }
      )
      .select();

    if (error) throw error;

    // Optimization: Run image processing in background
    if (data && data[0] && images.length > 0) {
      const propertyId = data[0].id;
      const optimizedImages = await Promise.all(
        images.slice(0, 3).map(img => optimizeAndUploadImage(img, propertyId))
      );
      
      const validImages = optimizedImages.filter(Boolean) as string[];
      if (validImages.length > 0) {
        await supabase
          .from("properties")
          .update({ images: validImages })
          .eq("id", propertyId);
        
        data[0].images = validImages;
      }
    }

    return NextResponse.json({
      success: true,
      mode: data?.[0] ? "upserted" : "inserted",
      record: data?.[0],
    });

  } catch (error: any) {
    console.error("Scraper API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
