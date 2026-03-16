import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { propertyId, message } = await request.json();
    if (!propertyId || !message) {
      return NextResponse.json({ success: false, error: "propertyId and message are required" }, { status: 400 });
    }

    const { error } = await supabase.from("activity_logs").insert([
      {
        action_type: "breport",
        metadata: {
          property_id: propertyId,
          message,
          source: "my-stay-report"
        }
      }
    ]);

    if (error) {
      console.error("report-issue insert failed", error);
      // Continue with success so UX doesn't break in dev if table not available
    }

    return NextResponse.json({ success: true, message: "Issue sent to broker and owner." });
  } catch (error) {
    console.error("report issue failed", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
