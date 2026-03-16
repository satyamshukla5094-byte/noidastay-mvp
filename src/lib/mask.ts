export function maskAadhaar(text: string) {
  if (!text) return text;
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length <= 4) return "****";
  return "********" + cleaned.slice(-4);
}

export function maskPan(text: string) {
  if (!text) return text;
  const cleaned = text.trim();
  if (cleaned.length <= 4) return "****";
  return "****" + cleaned.slice(-4);
}

export function maskSensitiveResponse(data: any) {
  if (!data || typeof data !== "object") return data;
  const out = Array.isArray(data) ? [...data] : { ...data };
  const maskField = (field: string) => {
    const v = out[field];
    if (typeof v === "string") {
      if (v.replace(/\D/g, "").length >= 10) {
        out[field] = "********" + v.replace(/\D/g, "").slice(-4);
      } else {
        out[field] = v;
      }
    }
  };
  ["aadhaar","aadhaar_number","masked_id","idNumber","pan","pan_number"].forEach((f) => {
    if (f in out) maskField(f);
  });
  return out;
}
