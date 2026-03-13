"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, GraduationCap, User, Phone, MapPin } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mockData"; // To get property names fallback

type Lead = {
  id: string;
  created_at: string;
  property_id: string;
  profiles?: {
    full_name: string;
    college: string;
    whatsapp_number: string;
  };
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select(`
            id,
            created_at,
            property_id,
            profiles (
              full_name,
              college,
              whatsapp_number
            )
          `)
          .order("created_at", { ascending: false });
        if (data) setLeads(data as any);
      } catch (e) {
        console.error("Error fetching leads:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("leads_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
        },
        async (payload) => {
          const newLeadId = payload.new.id;
          // Re-fetch the new lead to get the joined profile data
          const { data } = await supabase
            .from("leads")
            .select(`
              id,
              created_at,
              property_id,
              profiles (
                full_name,
                college,
                whatsapp_number
              )
            `)
            .eq("id", newLeadId)
            .single();
            
          if (data) {
            setLeads((prev) => [data as any, ...prev]);
          } else {
             // Fallback if query fails
             setLeads((prev) => [payload.new as any, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPropertyName = (id: string) => {
    return MOCK_PROPERTIES.find(p => p.id === id)?.title || "Unknown Property";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads & Inquiries</h1>
        <p className="text-gray-500 mt-1">Students who have viewed your phone number or contacted you.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No leads yet</h3>
            <p className="text-gray-500">When students click 'Show Number', they will appear here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {lead.profiles?.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                       {lead.profiles?.full_name || "Anonymous Student"}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        {lead.profiles?.college || "Unknown College"}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <MapPin className="h-4 w-4" />
                        Interested in {getPropertyName(lead.property_id)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(lead.created_at).toLocaleString()}
                  </div>
                  {lead.profiles?.whatsapp_number && (
                    <a
                      href={`https://wa.me/${lead.profiles.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-medium text-sm hover:underline"
                    >
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
