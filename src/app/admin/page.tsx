"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Search, Eye, MessageSquare, Filter, LineChart } from "lucide-react";

type ActivityLog = {
  id: string;
  role: string | null;
  action_type: string;
  metadata: Record<string, any>;
  timestamp: string;
};

export default function AdminActivityStream() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchLogs = async () => {
      try {
        const { data } = await supabase
          .from("activity_logs")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(50);
        if (data) setLogs(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchLogs();

    // Real-time subscription
    const channel = supabase
      .channel("activity_stream")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
        },
        (payload) => {
          setLogs((prev) => [payload.new as ActivityLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIconForAction = (action: string) => {
    switch (action) {
      case 'search': return <Search className="h-4 w-4 text-blue-500" />;
      case 'view_property': return <Eye className="h-4 w-4 text-emerald-500" />;
      case 'click_whatsapp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'filter_used': return <Filter className="h-4 w-4 text-purple-500" />;
      case 'update_price': return <LineChart className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatMetadata = (action: string, metadata: Record<string, any>) => {
    if (!metadata) return "";
    switch (action) {
      case 'search': return `Query: "${metadata.query}"`;
      case 'view_property': return `Property ID: ${metadata.property_id}`;
      case 'click_whatsapp': return `Property ID: ${metadata.property_id}`;
      case 'filter_used': return `Filters: ${JSON.stringify(metadata)}`;
      case 'update_price': return `Property ID: ${metadata.property_id}, New Price: ₹${metadata.price}`;
      default: return JSON.stringify(metadata);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
             <Activity className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Activity Stream</h1>
            <p className="text-gray-500 mt-1">Real-time pulse of user actions on NoidaStay.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {logs.length === 0 ? (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                 <Activity className="h-8 w-8 text-gray-300 mb-2 animate-pulse" />
                 Waiting for activity...
             </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="mt-1 p-2 bg-gray-100 rounded-full">
                    {getIconForAction(log.action_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                      <span className="capitalize">{log.action_type.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-400 font-normal">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatMetadata(log.action_type, log.metadata)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Role: {log.role || 'anonymous'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
