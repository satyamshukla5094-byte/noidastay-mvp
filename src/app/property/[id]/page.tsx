"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle, Phone, Share2, Star, ShieldCheck, X } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { useTracker } from "@/hooks/useTracker";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const property = MOCK_PROPERTIES.find(p => p.id === resolvedParams.id);
  const [showGallery, setShowGallery] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isLoggingNumber, setIsLoggingNumber] = useState(false);
  const { track } = useTracker();

  // Track property view on component mount
  useEffect(() => {
    const pId = resolvedParams.id;
    if (pId) {
      track("view_property", { property_id: pId });
    }
  }, [resolvedParams.id, track]);

  if (!property) {
    notFound();
  }

  const handleContactOwner = () => {
    track("click_whatsapp", { property_id: property?.id || "" });
    const phoneNumber = "919999999999";
    const message = `Hi, I'm interested in the PG in ${property?.sector} I saw on NoidaStay!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleShowNumber = async () => {
    setIsLoggingNumber(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: property.id,
          location: property.sector,
          action: 'view_phone'
        })
      });
    } catch (error) {
      console.error("Failed to log phone view", error);
    } finally {
      setIsLoggingNumber(false);
      setShowPhone(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this PG in ${property.sector} on NoidaStay!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to search</span>
          </Link>
          <div className="flex gap-4">
            <button 
              onClick={handleShare}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center text-gray-600 gap-4 text-sm mt-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
              <span className="font-medium text-gray-900">4.8</span>
              <span className="mx-1">·</span>
              <span className="underline cursor-pointer">12 reviews</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              <span>{property.sector} • {property.distanceInfo}</span>
            </div>
            {Boolean(property.ownerAadhaarName && property.ownerBillName && property.ownerAadhaarName.toLowerCase() === property.ownerBillName.toLowerCase() && property.verificationStatus === "verified") || property.isVerified ? (
              <div className="flex items-center text-emerald-600 font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Verified
              </div>
            ) : property.verificationStatus === "pending" ? (
              <div className="flex items-center text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
                Verification Pending
              </div>
            ) : null}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
          <div className="relative h-full w-full">
            <Image
              src={property.photos[0]}
              alt="Main property view"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            {property.photos.slice(1, 3).map((photo, index) => (
              <div key={index} className="relative h-full w-full">
                <Image
                  src={photo}
                  alt={`Property view ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            ))}
            {property.photos.length < 3 && (
              <div className="relative h-full w-full bg-gray-200" />
            )}
          </div>
          <button 
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md border hover:bg-gray-50 transition-colors z-10"
          >
            Show all photos
          </button>
        </div>

        {/* Full Screen Photo Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <button 
              onClick={() => setShowGallery(false)}
              className="absolute top-6 left-6 text-white hover:text-gray-300 p-2 rounded-full bg-black/50 transition-colors z-50"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="w-full max-w-4xl h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-4">
                {property.photos.map((photo, index) => (
                  <div key={index} className="relative w-full h-[60vh] md:h-[80vh]">
                     <Image
                      src={photo}
                      alt={`Property view ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column (Details) */}
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this place</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{property.description}</p>
              
              {/* Transparency / Verification Details Layer */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />
                  Verification Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1 ${property.ownerAadhaarName ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${property.ownerAadhaarName ? 'text-gray-900' : 'text-gray-500'}`}>Aadhaar Verified</p>
                      <p className="text-sm text-gray-500">Identity checked against Govt records.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1 ${property.ownerBillName ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${property.ownerBillName ? 'text-gray-900' : 'text-gray-500'}`}>Property Records Verified</p>
                      <p className="text-sm text-gray-500">Utility bills & tax receipts checked.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200 my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <hr className="border-gray-200 my-8" />

            <section className="mb-8 hidden sm:block">
              <h2 className="text-2xl font-semibold mb-6">Location</h2>
              <Map properties={[property]} />
            </section>

            <hr className="border-gray-200 my-8" />

            {/* Review Section */}
            <section className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Reviews</h2>
                <div className="flex items-center text-lg font-medium">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-1.5" />
                  4.8 <span className="text-gray-500 font-normal text-base ml-1">(12 reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mock Review 1 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Aryan S.</p>
                      <p className="text-sm text-gray-500">March 2026</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Amazing place! The food is actually good compared to other PGs, and the Wi-Fi never drops during my CS exams. Highly recommend!
                  </p>
                </div>

                {/* Mock Review 2 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      K
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Kavya M.</p>
                      <p className="text-sm text-gray-500">February 2026</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Extremely safe and the owner is very responsive to any maintenance issues. It is a 5-minute walk to my college, making early classes bearable.
                  </p>
                </div>
              </div>
              
              <button className="mt-6 px-5 py-2.5 rounded-xl border border-gray-900 font-semibold hover:bg-gray-50 transition-colors">
                Show all 12 reviews
              </button>
            </section>
          </div>

          {/* Right Column (Floating Sticky Card) */}
          <div className="relative">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/50">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{property.price.toLocaleString("en-IN")}</span>
                <span className="text-gray-500 font-medium">/ month</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl mb-6 divide-y divide-gray-200 text-sm">
                <div className="p-4 bg-gray-50 rounded-t-xl flex justify-between">
                  <span className="font-medium">Move-in Date</span>
                  <span className="text-emerald-600 font-medium">Available Now</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-gray-500">Deposit</span>
                  <span>1 Month Rent</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-gray-500">Lock-in</span>
                  <span>3 Months</span>
                </div>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold transition-colors text-lg mb-3 shadow-sm shadow-emerald-600/20"
                onClick={handleContactOwner}
              >
                <MessageCircle className="h-5 w-5" />
                Contact via WhatsApp
              </button>
              
              <button 
                onClick={handleShowNumber}
                disabled={showPhone || isLoggingNumber}
                className={`w-full flex items-center justify-center gap-2 bg-white border ${showPhone ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-300 hover:bg-gray-50 text-gray-900'} py-3 rounded-xl font-medium transition-colors`}
              >
                <Phone className="h-4 w-4" />
                {isLoggingNumber ? 'Loading...' : showPhone ? '+91 99999 99999' : 'Show Number'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
