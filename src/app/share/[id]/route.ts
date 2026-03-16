import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: property } = await supabase
      .from("properties")
      .select("title, price, sector, is_verified, category")
      .eq("id", propertyId)
      .single();

    if (!property) {
      return new NextResponse("Property not found", { status: 404 });
    }

    // Simple HTML response for now
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${property.title} - NoidaStay</title>
          <meta property="og:title" content="${property.title} - NoidaStay">
          <meta property="og:description" content="Verified PG accommodation in ${property.sector}, Greater Noida">
          <meta property="og:image" content="${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg">
          <meta property="og:url" content="${process.env.NEXT_PUBLIC_SITE_URL}/property/${propertyId}">
          <meta property="og:type" content="website">
          <meta property="og:site_name" content="NoidaStay">
        </head>
        <body>
          <h1>${property.title}</h1>
          <p>₹${property.price.toLocaleString("en-IN")}/month • ${property.sector}</p>
          <p>${property.is_verified ? "✅ Verified" : "🏠 Property"}</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Share page error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
