"use client";

import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUserId(null);
        setFavorites([]);
        setLoading(false);
        return;
      }
      setUserId(userData.user.id);
      const { data: favRows } = await supabase.from("favorites").select("property_id").eq("user_id", userData.user.id);
      const ids = (favRows ?? []).map((f: any) => f.property_id);
      if (ids.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      const { data: propertyRows } = await supabase.from("properties").select("id,title,price,sector,images,is_verified,lat,lng").in("id", ids);
      const mapped = (propertyRows ?? []).map((p: any) => ({
        id: p.id,
        title: p.title || "NoidaStay PG",
        price: Number(p.price) || 0,
        sector: p.sector || "",
        imageUrl: Array.isArray(p.images) && p.images[0] ? p.images[0] : "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        isVerified: !!p.is_verified,
        distanceInfo: p.lat && p.lng ? `${Number(p.lat).toFixed(3)}, ${Number(p.lng).toFixed(3)}` : "Near your location",
      }));
      setFavorites(mapped);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="p-8 max-w-6xl mx-auto w-full">Loading favorites...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Heart className="h-7 w-7 text-emerald-600" />Saved Favorites</h1>
          <p className="text-gray-500 mt-1">Quickly jump back to PGs you&apos;ve short-listed across Greater Noida.</p>
          <p className="text-xs text-gray-400 mt-1">User: {userId || "Not logged in"} • {favorites.length} favorites loaded</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-2"><Heart className="h-7 w-7 text-emerald-600" /></div>
          <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
          <p className="text-gray-500 max-w-md">Tap "Save to Favorites" on a property page to build your short-list.</p>
          <Link href="/" className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">Browse PGs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <Link key={property.id} href={`/property/${property.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                <Image src={property.imageUrl} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 shadow-sm"><Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />Saved</div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1"><h3 className="font-semibold text-gray-900 line-clamp-2">{property.title}</h3><div className="flex items-center text-gray-500 text-sm"><MapPin className="h-4 w-4 mr-1 text-emerald-600/70" /><span className="truncate">{property.sector} • {property.distanceInfo}</span></div><div className="mt-2 flex items-baseline gap-1"><span className="text-xl font-bold text-emerald-600">₹{property.price.toLocaleString("en-IN")}</span><span className="text-sm text-gray-500 font-medium">/mo</span></div></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
