"use client";

import { useState } from "react";
import { User, GraduationCap, MapPin, Phone } from "lucide-react";

export default function TenantProfilePage() {
  const [profile] = useState({
    name: "Test Student",
    college: "Galgotias University",
    course: "B.Tech CSE",
    year: "2nd Year",
    whatsapp: "+91 99999 99999",
    preferredSectors: ["Knowledge Park III", "Alpha 1"],
  });

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-7 w-7 text-emerald-600" />
            Tenant Profile
          </h1>
          <p className="text-gray-500 mt-1">
            This is how owners see your basic profile when you inquire about a PG.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex gap-4 items-center">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.college}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl p-4 flex gap-3 items-start">
            <GraduationCap className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Course & Year</p>
              <p className="text-sm text-gray-600">
                {profile.course} • {profile.year}
              </p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex gap-3 items-start">
            <Phone className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-600">{profile.whatsapp}</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex gap-3 items-start sm:col-span-2">
            <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Preferred Sectors</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.preferredSectors.map((sector) => (
                  <span
                    key={sector}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

