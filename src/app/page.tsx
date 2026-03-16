"use client";

import { Suspense, useEffect, useState } from "react";
import WelcomeToast from "@/components/WelcomeToast";
import HomeClient from "@/components/HomeClient";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, sector, images, is_verified, lat, lng")
        .limit(100);

      if (error) {
        setError(error);
      } else {
        const initialListings = (data ?? []).map((p: any) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          location: p.sector || "",
          image_url: Array.isArray(p.images) && p.images[0] ? p.images[0] : "/placeholder.jpg",
          is_verified: !!p.is_verified,
        }));
        setListings(initialListings);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (error) {
    return (
      <>
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <h3 className="font-semibold text-yellow-800">Database table missing</h3>
            <p className="text-sm text-yellow-700 mt-1">{error.message}</p>
            <p className="text-sm text-gray-700 mt-3">
              The application couldn't find the <strong>properties</strong> table in your Supabase project. To fix this, run the initial migrations in the Supabase SQL editor or run <code>supabase db push</code> from the CLI.
            </p>
          </div>
        </div>
        <HomeClient initialListings={[]} />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <HomeClient initialListings={listings} />
    </>
  );
}
