"use client";

import { Bell } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    title: "New lead on Premium Boys PG",
    body: "A student just viewed your phone number.",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Verification reminder",
    body: "Upload electricity bill on UP Bhulekh to unlock Verified badge.",
    time: "Yesterday",
  },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              Stay on top of inquiries, verification, and PG updates.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {mockNotifications.map((n) => (
            <div key={n.id} className="p-5 flex flex-col gap-1">
              <p className="text-xs text-gray-400">{n.time}</p>
              <h2 className="text-sm font-semibold text-gray-900">{n.title}</h2>
              <p className="text-sm text-gray-600">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

