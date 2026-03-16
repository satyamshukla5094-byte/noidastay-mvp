"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

export default function FavoritesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritePgs, setFavoritePgs] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      const { data: favs } = await supabase.from("favorites").select("property_id").eq("user_id", data.user.id);
      const ids = (favs ?? []).map((f: any) => f.property_id);
      setFavoriteIds(ids);
      if (ids.length > 0) {
        const { data: properties } = await supabase.from("properties").select("id,title,price,sector,images,is_verified,lat,lng,description").in("id", ids);
        const mapped = (properties ?? []).map((p: any) => ({
          id: p.id,
          title: p.title || "NoidaStay PG",
          price: Number(p.price) || 0,
          sector: p.sector || "Alpha",
          imageUrl: Array.isArray(p.images) && p.images[0] ? p.images[0] : "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
          isVerified: !!p.is_verified,
          distanceInfo: p.lat && p.lng ? `${Number(p.lat).toFixed(3)}, ${Number(p.lng).toFixed(3)}` : "Near your location",
        }));
        setFavoritePgs(mapped);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const removeFavorite = async (propertyId: string) => {
    if (!userId) return;
    setRemovingId(propertyId);
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("user_id", userId).eq("property_id", propertyId);
    setFavoriteIds((prev) => prev.filter((id) => id !== propertyId));
    setFavoritePgs((prev) => prev.filter((pg) => pg.id !== propertyId));
    setRemovingId(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Heart className="h-6 w-6 text-red-500 fill-red-500" />My Favorites</h1>
            {!loading && <p className="text-sm text-gray-500 mt-0.5">{favoritePgs.length} saved PG{favoritePgs.length !== 1 ? "s" : ""}</p>}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : favoritePgs.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4"><Heart className="h-10 w-10 text-red-300" /></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">Tap the heart icon on any PG to save it here for later.</p>
            <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors">Browse PGs</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritePgs.map((pg) => (
              <div key={pg.id} className="relative group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <Link href={`/property/${pg.id}`} className="flex flex-col flex-1">
                  <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                    <Image src={pg.imageUrl} alt={pg.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                    {pg.isVerified && <div className="absolute top-3 left-3 bg-emerald-600/95 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Verified</div>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{pg.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3"><MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-emerald-600/70" /><span className="truncate">{pg.sector} · {pg.distanceInfo}</span></div>
                    <div className="mt-auto flex items-baseline gap-1"><span className="text-xl font-bold text-emerald-600">₹{pg.price.toLocaleString("en-IN")}</span><span className="text-sm text-gray-500">/mo</span></div>
                  </div>
                </Link>
                <button onClick={() => removeFavorite(pg.id)} disabled={removingId === pg.id} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" aria-label="Remove from favorites">
                  {removingId === pg.id ? <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
