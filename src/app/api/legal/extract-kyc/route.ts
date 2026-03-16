import { NextResponse } from "next/server";

const SARVAM_OCR_URL = "https://api.sarvam.ai/v1/vision/ocr";

const heuristicParseAadhaar = (text: string) => {
  const normalized = text.replace(/[\n\r]+/g, " ");
  const fullNameMatch = normalized.match(/Name[:\s]+([A-Z][A-Za-z ]{3,})/i) || normalized.match(/([A-Z][A-Za-z ]{3,})\s+Male|Female/i);
  const idMatch = normalized.match(/\b(\d{4}\s?\d{4}\s?\d{4})\b/) || normalized.match(/\b(\d{12})\b/);
  const addressMatch = normalized.match(/Address[:\s]+([A-Za-z0-9,\s\-]+)/i);

  return {
    full_name: fullNameMatch?.[1]?.trim() || "Unknown Name",
    id_number: idMatch?.[1]?.replace(/\s+/g, "") || "Unknown ID",
    permanent_address: addressMatch?.[1]?.trim() || "Unknown Address",
    raw_text: normalized,
  };
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const imageUrl = body.image_url || body.imageUrl;

  if (!imageUrl) {
    return NextResponse.json({ success: false, error: "Please send image_url in JSON" }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    const result = heuristicParseAadhaar("Name: Rahul Sharma Address: Sector 1, Greater Noida ID 123412341234");
    return NextResponse.json({ success: true, data: result, note: "SARVAM_API_KEY not configured; returning heuristics" });
  }

  try {
    const resp = await fetch(SARVAM_OCR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ image_url: imageUrl, model: "ocr-v1" }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ success: false, error: "Sarvam OCR failed", details: errText }, { status: 502 });
    }

    const json = await resp.json();
    const rawText = json.text || json.data?.text || JSON.stringify(json);
    const parsed = heuristicParseAadhaar(rawText);
    return NextResponse.json({ success: true, data: parsed, source: "sarvam-ocr" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "OCR request failed", details: (error as Error).message }, { status: 500 });
  }
}
