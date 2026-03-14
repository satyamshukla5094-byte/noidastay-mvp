"use client";

import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("noidastay_favorites");
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      setFavoriteIds(parsed);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  const favorites = MOCK_PROPERTIES.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-7 w-7 text-emerald-600" />
            Saved Favorites
          </h1>
          <p className="text-gray-500 mt-1">
            Quickly jump back to PGs you&apos;ve short-listed across Greater Noida.
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <Heart className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
          <p className="text-gray-500 max-w-md">
            Tap &quot;Save to Favorites&quot; on a property page to build your short-list.
          </p>
          <Link
            href="/"
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Browse PGs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 shadow-sm">
                  <Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                  Saved
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-emerald-600/70" />
                  <span className="truncate">
                    {property.sector} • {property.distanceInfo}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-emerald-600">
                    ₹{property.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">/mo</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

