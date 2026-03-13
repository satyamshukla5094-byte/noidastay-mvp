"use client";

import { useState, useEffect } from "react";
import { Map as MapIcon, List, Search, SlidersHorizontal, Heart, Bell, User } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import Link from "next/link";
import { useTracker } from "@/hooks/useTracker";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

import { MOCK_PROPERTIES } from "@/lib/mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const { track } = useTracker();

  // Debounce search tracking
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timeoutId = setTimeout(() => {
      track("search", { query: searchQuery });
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, track]);

  const filteredProperties = MOCK_PROPERTIES.filter((property) => {
    const query = searchQuery.toLowerCase();
    return (
      property.title.toLowerCase().includes(query) ||
      property.sector.toLowerCase().includes(query) ||
      property.distanceInfo.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Sticky Header / Search Area */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-xl font-bold text-emerald-600 mr-2 flex items-center">
               <span className="hidden sm:inline">NoidaStay</span>
            </div>
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-full border-0 py-3.5 pl-11 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 shadow-sm transition-shadow hover:shadow-md"
                placeholder="Search by College or Sector (e.g., NIET, Alpha 1)"
              />
            </div>
            {/* Filter Button */}
            <button className="flex items-center justify-center p-3.5 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors bg-white">
              <SlidersHorizontal className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Owner / Profile Button */}
            <Link 
              href="/login"
              className="flex items-center justify-center px-4 py-2.5 rounded-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium transition-colors bg-white whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Most Visited</h1>
        </div>
        {/* View Toggle */}
        <div className="flex justify-end mb-6 mt-8">
           <button 
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              {showMap ? (
                <>
                  <List className="h-4 w-4" />
                  Show List
                </>
              ) : (
                <>
                  <MapIcon className="h-4 w-4" />
                  Show Map
                </>
              )}
            </button>
        </div>

        {/* Listings or Map View */}
        {showMap ? (
          <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-8">
            <Map properties={filteredProperties} height="100%" />
          </div>
        ) : (
          <>
            {/* Horizontal Scroll for Most Visited */}
            {!searchQuery && (
              <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar snap-x mb-8">
                {MOCK_PROPERTIES.slice(0, 3).map((property) => (
                  <div key={property.id} className="min-w-[85vw] sm:min-w-[340px] snap-center">
                    <Link href={`/property/${property.id}`} className="contents block appearance-none outline-none">
                      <PropertyCard {...property} />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
              {searchQuery ? "Search Results" : "Most Demanded"}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <Link href={`/property/${property.id}`} key={property.id} className="contents block appearance-none outline-none">
                    <PropertyCard {...property} />
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No properties found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between text-xs font-medium text-gray-500">
          <Link href="/" className="flex flex-col items-center gap-1 text-emerald-600">
            <Search className="h-6 w-6" />
            <span>Explore</span>
          </Link>
          <button className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <Heart className="h-6 w-6" />
            <span>Favorites</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <Bell className="h-6 w-6" />
            <span>Updates</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <User className="h-6 w-6" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
