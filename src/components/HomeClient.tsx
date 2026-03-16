"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Heart, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { createClient } from "@/utils/supabase/client";

const LOCALITIES = [
  "All Localities",
  "Alpha 1",
  "Alpha 2",
  "Beta 1",
  "Beta 2",
  "Knowledge Park I",
  "Knowledge Park II",
  "Knowledge Park III",
  "Pari Chowk",
  "Gamma 1",
  "Gamma 2",
  "Delta 1",
  "Omicron 1",
];

const MIN_PRICE = 3000;
const MAX_PRICE = 20000;

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image_url: string;
  is_verified: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function HomeClient({ initialListings }: { initialListings: Listing[] }) {
  const [query, setQuery] = useState("");
  const [locality, setLocality] = useState("All Localities");
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Load favorites from Supabase
        supabase
          .from("favorites")
          .select("property_id")
          .eq("user_id", data.user.id)
          .then(({ data: favs }) => {
            if (favs) setFavoriteIds(new Set(favs.map((f) => f.property_id)));
          });
      }
    });
  }, []);

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, mockId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!userId) {
        window.location.href = "/login";
        return;
      }
      // Map mock id to a stable UUID-like key using the mock property id
      // We use the mock id as property_id since we don't have real UUIDs from DB
      const supabase = createClient();
      setTogglingId(mockId);
      const isFav = favoriteIds.has(mockId);
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("property_id", mockId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(mockId);
          return next;
        });
      } else {
        await supabase.from("favorites").upsert({ user_id: userId, property_id: mockId });
        setFavoriteIds((prev) => new Set([...prev, mockId]));
      }
      setTogglingId(null);
    },
    [userId, favoriteIds]
  );

  // Use server-provided initial listings
  const filtered = useMemo(() => {
    return initialListings.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q);
      const matchesLocality =
        locality === "All Localities" ||
        (p.location || "").toLowerCase().includes(locality.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesQuery && matchesLocality && matchesPrice;
    });
  }, [query, locality, priceRange, initialListings]);

  const hasActiveFilters =
    locality !== "All Localities" ||
    priceRange[0] !== MIN_PRICE ||
    priceRange[1] !== MAX_PRICE;

  const clearFilters = () => {
    setLocality("All Localities");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setQuery("");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero + Search */}
      <section className="w-full bg-emerald-700 text-white py-16 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-sm">
          Find Your Perfect PG in Greater Noida
        </h1>
        <p className="text-lg text-emerald-100 mb-8 max-w-2xl">
          Verified, comfortable, and affordable PGs around Knowledge Park & beyond.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative shadow-lg rounded-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-full border-0 py-4 pl-14 pr-32 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 sm:text-base focus:outline-none"
            placeholder="Search by college, sector or locality..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`absolute right-2 top-2 bottom-2 px-5 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm ${
              showFilters || hasActiveFilters
                ? "bg-white text-emerald-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 absolute top-2 right-2" />
            )}
          </button>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="w-full max-w-2xl mt-4 bg-white rounded-2xl shadow-xl p-5 text-left text-gray-800 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:underline font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Locality Dropdown */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
              <div className="relative">
                <button
                  onClick={() => setLocalityOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span>{locality}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${localityOpen ? "rotate-180" : ""}`} />
                </button>
                {localityOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {LOCALITIES.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setLocality(loc);
                          setLocalityOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                          locality === loc ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-700"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range:{" "}
                <span className="text-emerald-600 font-semibold">
                  ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
                </span>
              </label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Min</p>
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={500}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < priceRange[1]) setPriceRange([val, priceRange[1]]);
                    }}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Max</p>
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={500}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > priceRange[0]) setPriceRange([priceRange[0], val]);
                    }}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹{MIN_PRICE.toLocaleString("en-IN")}</span>
                <span>₹{MAX_PRICE.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Listings */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {query || hasActiveFilters
              ? `${filtered.length} PG${filtered.length !== 1 ? "s" : ""} found`
              : "All PGs in Greater Noida"}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:underline font-medium flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500 bg-white shadow-sm border border-gray-100 rounded-2xl">
            <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No PGs match your search</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((pg) => {
              const isFav = favoriteIds.has(pg.id);
              const isToggling = togglingId === pg.id;
              return (
                <Link
                  key={pg.id}
                  href={`/property/${pg.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                    <Image
                      src={pg.image_url}
                      alt={pg.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Heart button */}
                    <button
                      onClick={(e) => toggleFavorite(e, pg.id)}
                      disabled={isToggling}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
                        isFav
                          ? "bg-red-500 text-white"
                          : "bg-white/90 text-gray-500 hover:text-red-500"
                      } ${isToggling ? "opacity-60" : ""}`}
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? "fill-white" : ""}`} />
                    </button>
                    {pg.is_verified && (
                      <div className="absolute top-3 left-3 bg-emerald-600/95 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{pg.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-emerald-600/70" />
                      <span className="truncate">{pg.location}</span>
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] text-purple-800 font-medium mb-2">
                      <span className="font-semibold">NoidaStay Verified</span> • 3x protections: legal agreement, escrow deposit, move-in support
                    </div>
                    <div className="mt-auto flex items-baseline gap-1">
                      <span className="text-xl font-bold text-emerald-600">
                        ₹{pg.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
