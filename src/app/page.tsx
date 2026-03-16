import { Suspense } from "react";
import WelcomeToast from "@/components/WelcomeToast";
import HomeClient from "@/components/HomeClient";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  // Fetch properties from Supabase server-side and pass to client component
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, price, sector, images, is_verified, lat, lng")
    .limit(100);

  const initialListings = (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    location: p.sector || "",
    image_url: Array.isArray(p.images) && p.images[0] ? p.images[0] : "/placeholder.jpg",
    is_verified: !!p.is_verified,
  }));
  // If the properties table is missing, PostgREST will return an error like
  // "Could not find the table 'public.properties' in the schema cache".
  // Show a helpful banner with next steps instead of an empty listing.
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
              The application couldn't find the <strong>properties</strong> table in your Supabase project. To fix this, run the initial migrations (see <code>supabase/migrations/20260312224251_init_schema.sql</code>) in the Supabase SQL editor or run <code>supabase db push</code> from the CLI.
            </p>
            <ol className="mt-2 text-sm text-gray-700 list-decimal pl-5">
              <li>Open the Supabase dashboard → SQL Editor.</li>
              <li>Paste the SQL from <strong>supabase/migrations/20260312224251_init_schema.sql</strong> and execute it.</li>
              <li>Re-run this page (refresh) — the listings will appear once the table exists.</li>
            </ol>
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
      <HomeClient initialListings={initialListings} />
    </>
  );
}
