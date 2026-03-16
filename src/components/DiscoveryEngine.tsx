"use client";

import { useState, useMemo, useEffect } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map as MapIcon, List as ListIcon, Filter, 
  Navigation, GraduationCap, MapPin, Search,
  ChevronRight, X, Wifi, Wind, Coffee, Bed,
  Users
} from "lucide-react";
import { COLLEGES, LANDMARKS } from "@/lib/constants/geo";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { supabase } from "@/lib/supabase";

interface DiscoveryEngineProps {
  initialCenter?: { lat: number; lng: number };
  areaName?: string;
}

export default function DiscoveryEngine({ initialCenter, areaName }: DiscoveryEngineProps) {
  const [view, setView] = useState<"map" | "list">("map");
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setPropertiesFiltered] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isParentStayMode, setIsParentStayMode] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [1000, 20000],
    category: "All",
    parentGuestRoom: false,
    amenities: [] as string[]
  });

  const [viewport, setViewport] = useState({
    latitude: initialCenter?.lat ?? COLLEGES[0].lat,
    longitude: initialCenter?.lng ?? COLLEGES[0].lng,
    zoom: 14
  });

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, lat, lng, sector, images, category, amenities, parent_guest_room, has_parent_room, parent_guest_room_price");
      
      if (data) {
        // Calculate distance for each property from current selected college
        const enriched = data.map(p => {
          const from = point([selectedCollege.lng, selectedCollege.lat]);
          const to = point([p.lng, p.lat]);
          const d = distance(from, to, { units: 'kilometers' });
          return { ...p, distance: d };
        });
        setProperties(enriched);
      }
      setLoading(false);
    }
    fetchProperties();
  }, [selectedCollege]);

  useEffect(() => {
    let result = properties.filter(p => {
      if (isParentStayMode && !p.has_parent_room) return false;
      
      const price = isParentStayMode ? (p.parent_guest_room_price || 0) : p.price;
      const matchPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      const matchCategory = filters.category === "All" || p.category === filters.category;
      const matchParent = !filters.parentGuestRoom || p.parent_guest_room;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPrice && matchCategory && matchParent && matchSearch;
    });

    // Sort by distance
    result.sort((a, b) => a.distance - b.distance);
    setPropertiesFiltered(result);
  }, [properties, filters, searchQuery]);

  const getMarkerColor = (category: string) => {
    switch (category) {
      case "Boys": return "bg-emerald-500";
      case "Girls": return "bg-pink-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="relative h-screen w-full bg-slate-50 overflow-hidden flex flex-col">
      {/* Top Search & Filter Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 pointer-events-auto">
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center px-4 py-2 gap-3">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search landmarks (NIET, Pari Chowk...)" 
              className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="h-6 w-px bg-slate-100 mx-2" />
            <select 
              className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer"
              value={selectedCollege.name}
              onChange={(e) => {
                const c = COLLEGES.find(col => col.name === e.target.value);
                if (c) {
                  setSelectedCollege(c);
                  setViewport(prev => ({ ...prev, latitude: c.lat, longitude: c.lng, zoom: 14 }));
                }
              }}
            >
              {COLLEGES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsParentStayMode(!isParentStayMode)}
              className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm transition-all ${isParentStayMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-100'}`}
            >
              <Users size={18} />
              {isParentStayMode ? "Parent Stay Active" : "Find Parent Room"}
            </button>
            <button 
              onClick={() => setShowFilters(true)}
              className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Filter size={20} />
            </button>
            <button 
              onClick={() => setView(view === "map" ? "list" : "map")}
              className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm"
            >
              {view === "map" ? <ListIcon size={18} /> : <MapIcon size={18} />}
              {view === "map" ? "List View" : "Map View"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Map View */}
      <div className={`flex-1 transition-opacity duration-500 ${view === "map" ? "opacity-100" : "opacity-0 invisible absolute"}`}>
        <Map
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <NavigationControl position="bottom-right" />
          
          {/* College Anchor */}
          <Marker latitude={selectedCollege.lat} longitude={selectedCollege.lng} anchor="bottom">
            <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
              <GraduationCap size={20} />
            </div>
          </Marker>

          {/* Property Markers */}
          {filteredProperties.map(p => (
            <Marker 
              key={p.id} 
              latitude={p.lat} 
              longitude={p.lng} 
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedProperty(p);
              }}
            >
              <div className={`cursor-pointer ${getMarkerColor(p.category)} text-white px-2 py-1 rounded-lg shadow-lg font-black text-xs border-2 border-white hover:scale-110 transition-transform`}>
                ₹{isParentStayMode ? p.parent_guest_room_price : (p.price / 1000).toFixed(1) + 'k'}
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {/* List View */}
      <AnimatePresence>
        {view === "list" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 overflow-y-auto p-4 pt-32 pb-24"
          >
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(p => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb'} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-900">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-1 truncate">{p.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-4">
                      <MapPin size={10} /> {p.distance.toFixed(1)}km from {selectedCollege.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-blue-600">
                        ₹{isParentStayMode ? (p.parent_guest_room_price?.toLocaleString()) : p.price.toLocaleString()}
                        <span className="text-xs text-slate-400 font-medium">/{isParentStayMode ? 'night' : 'mo'}</span>
                      </p>
                      <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-colors">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Mini Card */}
      <AnimatePresence>
        {selectedProperty && view === "map" && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-10 left-4 right-4 z-30"
          >
            <div className="max-w-lg mx-auto bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-4 flex gap-4 items-center overflow-hidden">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                <img src={selectedProperty.images?.[0]} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900 truncate">{selectedProperty.title}</h4>
                  <button onClick={() => setSelectedProperty(null)} className="p-1 hover:bg-slate-100 rounded-full">
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedProperty.distance.toFixed(1)}km from {selectedCollege.name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-blue-600">
                    ₹{isParentStayMode ? selectedProperty.parent_guest_room_price?.toLocaleString() : selectedProperty.price.toLocaleString()}
                    <span className="text-[10px] text-slate-400">/{isParentStayMode ? 'night' : 'mo'}</span>
                  </span>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg shadow-slate-200">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Side Panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-slate-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto">
                <section>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">Target Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["All", "Boys", "Girls", "Co-ed"].map(c => (
                      <button 
                        key={c}
                        onClick={() => setFilters({ ...filters, category: c })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${filters.category === c ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">Amenities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "wifi", label: "Free WiFi", icon: <Wifi size={14}/> },
                      { id: "ac", label: "Air Conditioned", icon: <Wind size={14}/> },
                      { id: "food", label: "Meals Included", icon: <Coffee size={14}/> },
                      { id: "single", label: "Single Seater", icon: <Bed size={14}/> },
                    ].map(a => (
                      <button 
                        key={a.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-bold text-xs"
                      >
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-blue-900 flex items-center gap-2">
                      <Users size={18} /> Parent Guest Room
                    </label>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={filters.parentGuestRoom}
                        onChange={(e) => setFilters({ ...filters, parentGuestRoom: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-blue-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-700 leading-relaxed">Show only PGs that offer dedicated rooms for visiting parents.</p>
                </section>
              </div>

              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-200 mt-8"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
