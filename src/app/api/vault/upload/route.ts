import { NextResponse } from "next/server";
import { uploadToVault } from "@/lib/vault";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("user_id") as string | null;
    const file = formData.get("file") as Blob | null;
    if (!userId || !file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: "user_id and file are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = formData.get("file_name") as string || `scan-${Date.now()}.jpg`;
    const contentType = file.type || "application/octet-stream";
    const filePath = await uploadToVault({ fileBuffer: buffer, fileName, userId, contentType });

    return NextResponse.json({ success: true, filePath });
  } catch (error: any) {
    console.error("Vault upload error", error);
    return NextResponse.json({ success: false, error: error.message || "upload failed" }, { status: 500 });
  }
}
