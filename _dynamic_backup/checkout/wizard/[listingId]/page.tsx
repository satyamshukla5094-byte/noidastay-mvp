import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BookingWizard from "@/components/BookingWizard";

interface BookingWizardPageProps {
  params: {
    listingId: string;
  };
}

export async function generateMetadata({ params }: BookingWizardPageProps): Promise<Metadata> {
  const supabase = await createClient();
  
  const { data: property } = await supabase
    .from("properties")
    .select("title, sector, price")
    .eq("id", params.listingId)
    .single();

  if (!property) {
    return {
      title: "Property Not Found - NoidaStay",
    };
  }

  return {
    title: `Book ${property.title} - NoidaStay`,
    description: `Complete your booking for ${property.title} in ${property.sector}. Quick verification, instant agreement, secure payment.`,
    robots: "noindex, nofollow",
  };
}

export default async function BookingWizardPage({ params }: BookingWizardPageProps) {
  const supabase = await createClient();
  
  // Verify property exists
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, title, price, sector, is_active")
    .eq("id", params.listingId)
    .single();

  if (error || !property) {
    notFound();
  }

  if (!property.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Property Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            This property is currently not available for booking.
          </p>
          <a
            href={`/property/${params.listingId}`}
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Back to Property
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Remove navigation for friction-less experience */}
      <BookingWizard listingId={params.listingId} />
    </div>
  );
}
