import { createClient } from "@/utils/supabase/server";
import { Search, MapPin, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MOCK_PROPERTIES } from "@/lib/mockData";

// Make the component async since we are fetching from Supabase
export default async function Home() {
  let listings: any[] | null = null;
  let error: { message: string } | null = null;

  try {
    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("listings")
      .select("id, title, price, location, image_url, is_verified")
      .order("created_at", { ascending: false });
    listings = data ?? [];
    if (dbError) {
      error = { message: dbError.message };
    }
  } catch (e: any) {
    error = { message: e?.message ?? "Service temporarily unavailable" };
  }

  const mostVisited = listings?.slice(0, 3) ?? [];
  const bestDemanded = listings?.slice(1, 4) ?? [];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-emerald-700 text-white py-20 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">
          Find Your Perfect PG in Knowledge Park
        </h1>
        <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl">
          NoidaStay connects you with verified, comfortable, and affordable PGs around Greater Noida.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative shadow-lg rounded-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 py-4 pl-14 pr-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-lg sm:leading-6 shadow-sm focus:outline-none"
            placeholder="Search by College or Sector"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-full font-semibold transition-colors duration-200">
            Search
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">
          Most visited
        </h2>

        {/* Supabase Error Handling */}
        {error && (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <p className="font-semibold">NoidaStay is in maintenance mode.</p>
            <p className="text-sm">
              Our PG listings are taking longer than usual to load. Please try again in a moment.
            </p>
          </div>
        )}

        {/* Dynamic Grid */}
        {!error && (!listings || listings.length === 0) ? (
          <div className="py-20 text-center text-gray-500 bg-white shadow-sm border border-gray-100 rounded-2xl">
            <p className="text-lg">No properties found.</p>
            <p className="text-sm">Please check back later or modify your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mostVisited.map((pg) => {
              const mock = MOCK_PROPERTIES.find((p) => p.title === pg.title);
              const href = mock ? `/property/${mock.id}` : "#";

              const CardContent = (
                <>
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                    {pg.image_url ? (
                      <Image
                        src={pg.image_url}
                        alt={pg.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {/* Price & Verification Badge Overlay */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm inline-flex items-baseline gap-1.5">
                        <span className="font-bold text-gray-900">₹{pg.price?.toLocaleString("en-IN") || "N/A"}</span>
                        <span className="text-xs text-gray-500 font-medium">/ mo</span>
                      </div>
                      {pg.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/95 text-white shadow-sm">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 line-clamp-1">
                      {pg.title || "Untitled PG"}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 mt-auto">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-emerald-600/70" />
                      <span className="text-sm truncate">
                        {pg.location || "Location not specified"}
                      </span>
                    </div>
                  </div>
                </>
              );

              return mock ? (
                <Link
                  key={pg.id}
                  href={href}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {CardContent}
                </Link>
              ) : (
                <div
                  key={pg.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col"
                >
                  {CardContent}
                </div>
              );
            })}
          </div>
        )}

        {/* Best Demanded Available */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">
            Best Demanded Available
          </h2>
          {!error && bestDemanded.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {bestDemanded.map((pg) => {
                const mock = MOCK_PROPERTIES.find((p) => p.title === pg.title);
                const href = mock ? `/property/${mock.id}` : "#";
                const CardContent = (
                  <>
                    <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                      {pg.image_url ? (
                        <Image
                          src={pg.image_url}
                          alt={pg.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-3 flex justify-between items-start">
                        {pg.is_verified && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/95 text-white shadow-sm">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 line-clamp-1">
                        {pg.title || "Untitled PG"}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-auto mb-2">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-emerald-600/70" />
                        <span className="text-sm truncate">
                          {pg.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-emerald-600">
                            ₹{pg.price?.toLocaleString("en-IN") || "N/A"}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">/ mo</span>
                        </div>
                        <button
                          type="button"
                          className="p-2 rounded-full border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                );

                return mock ? (
                  <Link
                    key={`best-${pg.id}`}
                    href={href}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {CardContent}
                  </Link>
                ) : (
                  <div
                    key={`best-${pg.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col"
                  >
                    {CardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
