"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Heart, MapPin, MessageCircle, Phone, Share2, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ReviewSection from "@/components/ReviewSection";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
      Loading Map...
    </div>
  ),
});

interface Property {
  id: string;
  title: string;
  price: number;
  sector: string;
  description?: string;
  images?: string[];
  is_verified?: boolean;
  ownerAadhaarName?: string;
  ownerBillName?: string;
  verificationStatus?: string;
  lat?: number;
  lng?: number;
  amenities?: string[];
  distanceInfo?: string;
}

export default function PropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isLoggingNumber, setIsLoggingNumber] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userKycStatus, setUserKycStatus] = useState<"pending" | "verified" | "rejected">("pending");

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      const { data, error: e } = await supabase.from("properties").select("*").eq("id", propertyId).single();
      if (e || !data) {
        setError(e?.message || "Property not found");
        setLoading(false);
        return;
      }
      const item: Property = {
        id: data.id,
        title: data.title || "NoidaStay PG",
        price: Number(data.price) || 0,
        sector: data.sector || "Alpha",
        description: data.description || "Comfortable PG near your campus.",
        images: Array.isArray(data.images) && data.images.length ? data.images : [
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        ],
        is_verified: !!data.is_verified,
        ownerAadhaarName: data.owner_aadhaar_name ?? data.ownerAadhaarName,
        ownerBillName: data.owner_bill_name ?? data.ownerBillName,
        verificationStatus: data.verification_status ?? data.verificationStatus,
        lat: Number(data.lat) || 0,
        lng: Number(data.lng) || 0,
        amenities: Array.isArray(data.amenities) ? data.amenities : ["24/7 Security", "Free WiFi", "Housekeeping"],
        distanceInfo:
          data.distance_info || data.distanceInfo || (data.lat && data.lng ? `${Number(data.lat).toFixed(3)}, ${Number(data.lng).toFixed(3)}` : "Near main road"),
      };
      setProperty(item);
      setLoading(false);
    };

    load();
  }, [propertyId]);

  useEffect(() => {
    const supabase = createClient();
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("property_id", propertyId)
        .maybeSingle();
      setIsFavorite(!!fav);
      const { data: profile } = await supabase.from("profiles").select("kyc_status").eq("id", data.user.id).single();
      setUserKycStatus((profile as any)?.kyc_status || "pending");
    };
    loadUser();
  }, [propertyId]);

  const toggleFavorite = useCallback(async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    if (!property) return;

    setFavLoading(true);
    const supabase = createClient();
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("property_id", property.id);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").upsert({ user_id: userId, property_id: property.id });
      setIsFavorite(true);
    }
    setFavLoading(false);
  }, [userId, isFavorite, property, router]);

  const handleContactOwner = () => {
    if (!property) return;
    const msg = encodeURIComponent(`Hi, I'm interested in the PG in ${property.sector} I saw on NoidaStay!`);
    window.open(`https://wa.me/919999999999?text=${msg}`, "_blank");
  };

  const handleShowNumber = async () => {
    if (!property) return;
    setIsLoggingNumber(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, location: property.sector, action: "view_phone" }),
      });
    } catch {}
    setShowPhone(true);
    setIsLoggingNumber(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading property...</div>;
  }
  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">{error || "Property not found"}</div>;
  }

  const isActuallyVerified = Boolean(
    (property.ownerAadhaarName && property.ownerBillName && property.ownerAadhaarName.toLowerCase() === property.ownerBillName.toLowerCase() && property.verificationStatus === "verified") ||
      property.is_verified
  );

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={toggleFavorite} disabled={favLoading} className={`p-2 rounded-full border transition-all ${isFavorite ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"}`} aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}>
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>
            <button onClick={() => navigator.share ? navigator.share({ title: property.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} className="p-2 rounded-full border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 gap-3 text-sm mt-2">
            <div className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{property.sector} • {property.distanceInfo}</div>
            {userKycStatus === "verified" && (
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="h-3 w-3" /> Student is KYC Verified ✅
              </div>
            )}
            {isActuallyVerified ? <div className="flex items-center text-emerald-600 font-medium"><CheckCircle2 className="h-4 w-4 mr-1" />Verified</div> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
          <div className="relative h-full w-full"><Image src={property.images?.[0] ?? "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"} alt="Main view" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority /></div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">{(property.images?.slice(1, 3) ?? []).map((photo, i) => <div key={i} className="relative h-full w-full"><Image src={photo} alt={`View ${i}`} fill className="object-cover" sizes="50vw" /></div>)}{(!property.images || property.images.length < 3) && <div className="relative h-full bg-gray-200" />}</div>
          <button onClick={() => setShowGallery(true)} className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md border hover:bg-gray-50 transition-colors z-10">Show all photos</button>
        </div>

        {showGallery && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
            <button onClick={() => setShowGallery(false)} className="absolute top-6 left-6 text-white p-2 rounded-full bg-black/50"><ArrowLeft className="h-6 w-6" /></button>
            <div className="w-full max-w-4xl h-[80vh] overflow-y-auto"><div className="flex flex-col gap-4">{(property.images ?? []).map((photo, idx) => <div key={idx} className="relative w-full h-[60vh] md:h-[80vh]"><Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-contain" sizes="100vw" /></div>)}</div></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">About this place</h2><p className="text-gray-600 leading-relaxed text-lg mb-6">{property.description}</p><div className="bg-gray-50 border border-gray-200 rounded-2xl p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />Verification Details</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="flex items-start gap-3"><div className={`mt-0.5 rounded-full p-1 ${property.ownerAadhaarName ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}><CheckCircle2 className="h-4 w-4" /></div><div><p className={`font-medium ${property.ownerAadhaarName ? "text-gray-900" : "text-gray-500"}`}>Aadhaar Verified</p><p className="text-sm text-gray-500">Identity checked against Govt records.</p></div></div><div className="flex items-start gap-3"><div className={`mt-0.5 rounded-full p-1 ${property.ownerBillName ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}><CheckCircle2 className="h-4 w-4" /></div><div><p className={`font-medium ${property.ownerBillName ? "text-gray-900" : "text-gray-500"}`}>Property Records Verified</p><p className="text-sm text-gray-500">Utility bills & tax receipts checked.</p></div></div></div></div></section><hr className="border-gray-200 my-8" /><section className="mb-8"><h2 className="text-2xl font-semibold mb-6">What this place offers</h2><div className="grid grid-cols-2 gap-y-4 gap-x-8">{(property.amenities ?? ["24/7 Security", "Free WiFi", "Housekeeping"]).map((amenity, index) => <div key={index} className="flex items-center text-gray-700"><CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3" /> <span>{amenity}</span></div>)}</div></section><hr className="border-gray-200 my-8" /><section className="mb-8 hidden sm:block"><h2 className="text-2xl font-semibold mb-6">Location</h2><Map properties={[{ id: property.id, lat: Number(property.lat) || 0, lng: Number(property.lng) || 0, title: property.title, price: property.price, is_verified: property.is_verified ?? false, images: property.images ?? [] }]} /></section><hr className="border-gray-200 my-8" /><ReviewSection propertyId={property.id} /></div>
          <div className="relative"><div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/50"><div className="flex items-baseline gap-1 mb-3"><span className="text-3xl font-bold text-gray-900">₹{property.price.toLocaleString("en-IN")}</span><span className="text-gray-500 font-medium">/ month</span></div><div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3 mb-3 text-sm text-purple-900"><div className="font-semibold">NoidaStay Verified Broker Guarantee</div><div className="mt-2 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-900">As your Digital Broker, we guarantee:</strong><ul className="list-disc pl-4 mt-1 space-y-0.5"><li>Legal Rent Agreement</li><li>Escrow Deposit Protection</li><li>24h Move-in Support</li></ul></div></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-3 mb-4 text-sm text-amber-900"><div className="font-semibold">Brokerage Service Fee ₹499</div><div className="mt-1 text-gray-700">This covers your e-Stamping, legal paperwork, and deposit protection.</div></div><div className="border border-gray-200 rounded-xl mb-6 divide-y divide-gray-200 text-sm"><div className="p-4 bg-gray-50 rounded-t-xl flex justify-between"><span className="font-medium">Move-in Date</span><span className="text-emerald-600 font-medium">Available Now</span></div><div className="p-4 flex justify-between items-center"><span className="font-medium text-gray-500">Deposit</span><span>1 Month Rent</span></div><div className="p-4 flex justify-between items-center"><span className="font-medium text-gray-500">Lock-in</span><span>3 Months</span></div></div><button onClick={() => router.push(`/my-stay?propertyId=${property.id}`)} className="w-full mb-3 flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl font-semibold transition-colors"><ShieldCheck className="h-4 w-4" />Book with NoidaStay</button><button onClick={toggleFavorite} disabled={favLoading} className={`w-full mb-3 flex items-center justify-center gap-2 border py-3 rounded-xl font-medium transition-colors ${isFavorite ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"}`}><Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />{isFavorite ? "Saved to Favorites" : "Save to Favorites"}</button><button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors text-lg mb-3" onClick={handleContactOwner}><MessageCircle className="h-5 w-5" />Contact via WhatsApp</button><button onClick={handleShowNumber} disabled={showPhone || isLoggingNumber} className={`w-full flex items-center justify-center gap-2 bg-white border ${showPhone ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-gray-300 hover:bg-gray-50 text-gray-900"} py-3 rounded-xl font-medium transition-colors`}>{showPhone ? "+91 99999 99999" : isLoggingNumber ? "Loading..." : "Show Number"}</button><button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"><Share2 className="h-4 w-4" />Share this PG</button></div></div>
        </div>
      </div>
    </main>
  );
}
