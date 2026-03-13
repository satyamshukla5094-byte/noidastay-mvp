"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Calendar, Home, Phone, MapPin } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mockData";

type Tenant = {
  id: string;
  property_id: string;
  student_name: string;
  room_number: string;
  move_in_date: string;
  created_at: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    property_id: MOCK_PROPERTIES[0]?.id || "",
    student_name: "",
    room_number: "",
    move_in_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (data) setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("tenants")
        .insert([formData])
        .select()
        .single();

      if (data) {
        setTenants([data, ...tenants]);
        setIsAdding(false);
        setFormData({ ...formData, student_name: "", room_number: "" });
      } else {
        // Fallback for mock backend
        const mockTenant = { 
          id: Math.random().toString(), 
          created_at: new Date().toISOString(), 
          ...formData 
        };
        setTenants([mockTenant, ...tenants]);
        setIsAdding(false);
        setFormData({ ...formData, student_name: "", room_number: "" });
      }
    } catch (e) {
      console.error("Error adding tenant", e);
    }
  };

  const getPropertyName = (id: string) => {
    return MOCK_PROPERTIES.find(p => p.id === id)?.title || "Unknown Property";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage the students currently living in your properties.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Tenant
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Tenant</h3>
          <form onSubmit={handleAddTenant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <select 
                value={formData.property_id}
                onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                className="w-full rounded-xl border-gray-300 border py-2 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600"
                required
              >
                {MOCK_PROPERTIES.map(p => (
                   <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input 
                type="text" 
                value={formData.student_name}
                onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                className="w-full rounded-xl border-gray-300 border py-2 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600"
                required 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input 
                type="text" 
                value={formData.room_number}
                onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                className="w-full rounded-xl border-gray-300 border py-2 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600"
                required 
                placeholder="101A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
              <input 
                type="date" 
                value={formData.move_in_date}
                onChange={(e) => setFormData({...formData, move_in_date: e.target.value})}
                className="w-full rounded-xl border-gray-300 border py-2 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600"
                required 
              />
            </div>
            <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
               <button 
                 type="button" 
                 onClick={() => setIsAdding(false)}
                 className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
               >
                 Save Tenant
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Tenants Found</h3>
            <p className="text-gray-500">Add your first tenant to start managing them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Room</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Move-in Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                           {tenant.student_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{tenant.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-1.5">
                       <MapPin className="h-4 w-4 text-gray-400" />
                       {getPropertyName(tenant.property_id)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                       <div className="flex items-center gap-1.5 font-medium">
                         <Home className="h-4 w-4 text-gray-400" />
                         {tenant.room_number}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                       <div className="flex items-center gap-1.5">
                         <Calendar className="h-4 w-4 text-gray-400" />
                         {new Date(tenant.move_in_date).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-emerald-600 font-medium hover:text-emerald-700 text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
