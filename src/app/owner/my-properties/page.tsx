"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, Edit3, EyeOff, Eye, Trash2, 
  Plus, CheckCircle2, AlertCircle, Loader2,
  TrendingUp, ArrowUpRight, ShieldCheck, MapPin,
  ExternalLink, MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MyPropertiesDashboard() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*, property_verifications(*)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setProperties(data);
      setLoading(false);
    }
    loadProperties();
  }, []);

  const handleUpdatePrice = async (id: string, newPrice: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ price: parseInt(newPrice), updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (!error) {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, price: parseInt(newPrice) } : p));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRequestVerification = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from("property_verifications")
        .update({ site_visit_requested_at: new Date().toISOString() })
        .eq("property_id", id);

      if (!error) {
        const msg = encodeURIComponent(`Hi Satyam, I've listed '${title}' and would like to request a site visit for verification. Please let me know your availability!`);
        window.open(`https://wa.me/919999999999?text=${msg}`, "_blank");
        
        // Refresh local state
        setProperties(prev => prev.map(p => p.id === id ? { 
          ...p, 
          property_verifications: [{ ...p.property_verifications[0], site_visit_requested_at: new Date().toISOString() }] 
        } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500 font-medium">Loading your inventory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Properties</h1>
            <p className="text-slate-500 font-medium">Manage your PG inventory and pricing in real-time.</p>
          </div>
          <Link href="/list-my-pg" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
            <Plus size={20} strokeWidth={3} /> Add New Listing
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {properties.length > 0 ? properties.map((prop) => {
            const verification = prop.property_verifications?.[0];
            const isVerified = prop.is_verified;
            
            return (
              <motion.div 
                key={prop.id}
                layout
                className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Image Section */}
                <div className="lg:w-80 h-64 lg:h-auto relative bg-slate-100 shrink-0">
                  <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb'} className="w-full h-full object-cover" alt="" />
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${
                    prop.visibility_status === 'public' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-900 text-white border-slate-800'
                  }`}>
                    {prop.visibility_status === 'public' ? <Eye size={12} /> : <EyeOff size={12} />}
                    {prop.visibility_status}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-slate-900">{prop.title}</h3>
                        {isVerified && (
                          <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-blue-100">
                            <ShieldCheck size={12} /> VERIFIED
                          </div>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={12} /> {prop.sector}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Monthly Rent</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-blue-600">₹{prop.price.toLocaleString()}</span>
                          {updatingId === prop.id && <Loader2 className="animate-spin text-blue-600" size={16} />}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newPrice = prompt("Enter new monthly rent:", prop.price);
                          if (newPrice && !isNaN(parseInt(newPrice))) handleUpdatePrice(prop.id, newPrice);
                        }}
                        className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm border border-slate-100 transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
                    {/* Verification Card */}
                    {!isVerified ? (
                      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                          <AlertCircle size={18} />
                          {verification?.site_visit_requested_at ? "Visit Requested" : "Verification Required"}
                        </div>
                        <p className="text-xs text-amber-600 leading-relaxed mb-4">
                          {verification?.site_visit_requested_at 
                            ? "Satyam will contact you shortly to schedule the site visit." 
                            : "Verified listings get 4x more leads. Request a physical site visit to get your Blue Tick."}
                        </p>
                        {!verification?.site_visit_requested_at && (
                          <button 
                            onClick={() => handleRequestVerification(prop.id, prop.title)}
                            className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} /> Request Site Visit
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                          <CheckCircle2 size={18} /> Quality Certified
                        </div>
                        <p className="text-xs text-emerald-600 leading-relaxed">
                          This property has passed NoidaStay quality standards. Site visit completed by Admin.
                        </p>
                      </div>
                    )}

                    {/* Stats Card */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inquiries</p>
                          <TrendingUp className="text-emerald-400" size={14} />
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black">24</span>
                          <span className="text-[10px] text-emerald-400 font-bold mb-1">+12% this week</span>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                        <ArrowUpRight size={80} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <Building className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-bold text-slate-900">No properties listed yet</h3>
              <p className="text-slate-400 mt-2 mb-8">Start listing your PG to reach 5,000+ verified students.</p>
              <Link href="/list-my-pg" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold inline-block">
                List Your First PG
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
