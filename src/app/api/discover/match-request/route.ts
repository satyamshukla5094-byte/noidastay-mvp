import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { senderId, receiverId } = await request.json();

    if (!senderId || !receiverId) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check if both are verified
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, kyc_status, full_name")
      .in("id", [senderId, receiverId]);

    if (!profiles || profiles.length < 2) {
      return NextResponse.json({ success: false, error: "Profiles not found" }, { status: 404 });
    }

    if (profiles.some(p => p.kyc_status !== 'verified')) {
      return NextResponse.json({ success: false, error: "Both users must be KYC verified" }, { status: 403 });
    }

    // 2. Check for existing match request
    const { data: existing } = await supabase
      .from("match_requests")
      .select("*")
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ success: true, message: "Already matched" });
      }
      
      // If receiver is now "accepting" the request from sender
      if (existing.receiver_id === senderId) {
        const { error: updateError } = await supabase
          .from("match_requests")
          .update({ status: 'accepted' })
          .eq("id", existing.id);

        if (updateError) throw updateError;

        // 3. CREATE CONVERSATION (Mutual Acceptance)
        // Find owner of a listing if they are matching for a specific room?
        // Actually, for roommate matching, it's student-to-student.
        // We'll create a conversation with a special flag or null listing_id for now
        // Or link it to the listing they were both looking at.
        
        await supabase.from("audit_logs").insert({
          user_id: senderId,
          action_type: "ROOMMATE_MATCH_ACCEPTED",
          details: { match_id: existing.id, peer_id: receiverId }
        });

        return NextResponse.json({ success: true, status: 'accepted' });
      }
    }

    // 4. Create New Request
    const { error: insertError } = await supabase
      .from("match_requests")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, status: 'pending' });

  } catch (error: any) {
    console.error("Match Request Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
