import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const userId = body.user_id ?? "unknown";
    const documentId = body.document_id ?? "unknown";
    const timestamp = body.timestamp ?? new Date().toISOString();

    const webhookUrl = Deno.env.get("SECURITY_ALERT_DISCORD_WEBHOOK");
    if (webhookUrl) {
      const message = {
        content: `🚨 SECURITY ALERT: User ${userId} just accessed Aadhaar Document ${documentId} at ${timestamp}.`,
      };
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
