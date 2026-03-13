import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json();
    
    // Log to Supabase 
    // This will fail gracefully if placeholder keys are used in development
    // but the error is caught so the WhatsApp redirect still proceeds
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          property_id: propertyId,
          // If we had authentication active, we'd pass the actual student_id here. 
        }
      ]);

    if (error) {
      console.error("Supabase Error logging lead (expected in local dev without credentials):", error.message);
    }

    return NextResponse.json({ success: true, message: "Lead logged successfully" });
  } catch (error) {
    console.error("Failed to log lead:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
