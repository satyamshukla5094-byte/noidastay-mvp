import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import axios from "axios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function optimizeAndUploadImage(imageUrl: string, propertyId: string): Promise<string | null> {
  try {
    // 1. Fetch the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Optimize using Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // 3. Upload to Supabase Storage (public bucket for property images)
    const fileName = `${propertyId}/${Date.now()}-optimized.jpg`;
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // 4. Return the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return imageUrl; // Fallback to original URL if optimization fails
  }
}
