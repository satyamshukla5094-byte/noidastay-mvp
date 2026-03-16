import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { propertyId, oldPrice, newPrice, dealType } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch students who favorited this property
    const { data: favorites, error: favError } = await supabase
      .from("favorites")
      .select("*, profiles(full_name, whatsapp_number)")
      .eq("property_id", propertyId);

    if (favError) throw favError;

    // 2. Trigger WhatsApp notification logic for each student
    for (const fav of (favorites || [])) {
      const student = fav.profiles as any;
      if (student?.whatsapp_number) {
        console.log(`[PRICE DROP ALERT] to ${student.whatsapp_number}: Hey ${student.full_name.split(' ')[0]}! The PG you liked just dropped its price from ₹${oldPrice} to ₹${newPrice}. Grab it now: ${process.env.NEXT_PUBLIC_SITE_URL}/property/${propertyId} - NoidaStay`);
      }
    }

    return NextResponse.json({ success: true, alerted: favorites?.length || 0 });
  } catch (error: any) {
    console.error("Price Drop Alert Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
