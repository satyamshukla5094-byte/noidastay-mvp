import { NextResponse } from "next/server";
import { generateDigitalAgreement } from "@/lib/legal";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = body.profile ?? {
      fullName: "Student Tenant",
      masked_id: "********1234",
      permanent_address: "Sector 1, Greater Noida",
      dob: "01/01/2000",
    };
    const property = body.property ?? {
      id: "unknown",
      title: "Sample PG",
      address: "Sector 1, Greater Noida",
      monthly_rent: 9499,
    };

    const url = await generateDigitalAgreement(profile, property);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("generate-agreement error", error);
    return NextResponse.json({ success: false, error: "Could not generate agreement", details: (error as Error).message }, { status: 500 });
  }
}
