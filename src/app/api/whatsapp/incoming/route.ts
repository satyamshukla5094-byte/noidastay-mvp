import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with Service Role for administrative access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * WhatsApp Concierge - Incoming Webhook Handler
 * This route handles messages from Twilio or WABA
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string; // User's WhatsApp number
    const body = (formData.get("Body") as string)?.trim().toLowerCase() || "";

    if (!from || !body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 1. Security Check: Only respond to registered phone numbers
    // Note: Phone numbers from Twilio come in 'whatsapp:+91...' format
    const cleanedPhone = from.replace("whatsapp:", "");
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("whatsapp_number", cleanedPhone)
      .single();

    if (profileError || !profile) {
      console.warn(`Unregistered contact attempt: ${cleanedPhone}`);
      return NextResponse.json({ success: true, message: "Unregistered" });
    }

    // 2. Rate Limiting & Natural Feel Delay
    // In a serverless env, we'll use a simple sleep (Note: this adds to execution time)
    await new Promise(resolve => setTimeout(resolve, 2000));

    let responseMessage = "";

    // 3. Intent Detection Logic
    if (body === "status") {
      responseMessage = await handleStatusQuery(profile);
    } else if (body.startsWith("price ")) {
      const pgName = body.replace("price ", "").trim();
      responseMessage = await handlePriceQuery(pgName);
    } else if (body === "location") {
      responseMessage = await handleLocationQuery(profile.id);
    } else if (body === "help") {
      responseMessage = "NoidaStay Commands:\n- 'Status': Check your booking/KYC\n- 'Price [PG Name]': Get PG pricing\n- 'Location': Get visit location link\n- 'Help': View this list";
    } else {
      // unknown query - track for human handoff
      responseMessage = await handleUnknownQuery(profile.id, body);
    }

    // 4. Send Response via Twilio (Mocked logic for now)
    console.log(`[WHATSAPP RESPONSE TO ${from}]: ${responseMessage}\n\nType 'More' to see similar PGs near NIET.`);

    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${responseMessage}\n\nType 'More' to see similar PGs near NIET.</Message></Response>`, {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleStatusQuery(profile: any) {
  // Query bookings (legal_agreements) and transactions
  const [agreementsRes, txRes] = await Promise.all([
    supabase.from("legal_agreements").select("*").eq("student_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("transactions").select("*").eq("user_id", profile.id).eq("status", "escrow_held").limit(1).maybeSingle()
  ]);

  const agreement = agreementsRes.data;
  const transaction = txRes.data;

  let msg = `Hi ${profile.full_name?.split(' ')[0]}! `;
  
  if (transaction) {
    msg += `Your deposit of ₹${transaction.amount} is currently SECURE in Escrow. `;
  } else {
    msg += "No active escrow deposits found. ";
  }

  if (agreement) {
    msg += `Your agreement status is: ${agreement.status?.toUpperCase()}. `;
  }

  return msg;
}

async function handlePriceQuery(pgName: string) {
  const { data: property } = await supabase
    .from("properties")
    .select("price, title")
    .ilike("title", `%${pgName}%`)
    .limit(1)
    .single();

  if (property) {
    return `The monthly rent for ${property.title} starts at ₹${property.price}.`;
  }
  return `Sorry, I couldn't find a PG named '${pgName}'. Try 'Price [Name]'.`;
}

async function handleLocationQuery(studentId: string) {
  // Check for confirmed visits
  const { data: visit } = await supabase
    .from("visits")
    .select("*, properties(title, lat, lng)")
    .eq("student_id", studentId)
    .eq("status", "confirmed")
    .order("scheduled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (visit && (visit.properties as any).lat) {
    const p = visit.properties as any;
    return `Your confirmed visit to ${p.title} is at: https://www.google.com/maps?q=${p.lat},${p.lng}`;
  }
  return "You don't have any confirmed visits scheduled right now.";
}

async function handleUnknownQuery(userId: string, body: string) {
  // Simple failure count tracking in a real app would use Redis or DB
  // For MVP, we'll log it to audit_logs
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action_type: "WHATSAPP_UNKNOWN_QUERY",
    details: { content: body }
  });

  return "I'm not sure how to help with that yet. Try typing 'Help' for a list of commands.";
}
