import { NextResponse } from "next/server";

const SARVAM_TTS_URL = "https://api.sarvam.ai/v1/tts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = body.text || "NoidaStay: आपका डिजिटल ब्रोकर, यह समझौता पत्र आपके और मालिक के बीच किराये की शर्तों को जोड़ता है।";

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "SARVAM_API_KEY not set for TTS" }, { status: 400 });
  }

  try {
    const response = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sarvam-t2", // placeholder model
        voice: "hindi-male",
        text,
        format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ success: false, error: "TTS request failed", details: err }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ success: true, audioBase64: base64 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
