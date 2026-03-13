"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings, Users, ArrowLeft } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Leads & Inquiries", href: "/dashboard/leads", icon: MessageSquare },
    { name: "Tenants", href: "/dashboard/tenants", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Homepage
          </Link>
          <h2 className="text-xl font-bold text-emerald-600">NoidaStay Owner</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              T
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">Test Owner</p>
              <p className="text-gray-500">test@noidastay.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 md:hidden z-10">
            <h2 className="text-xl font-bold text-emerald-600">NoidaStay Owner</h2>
        </header>
        
        {children}
      </main>
    </div>
  );
}
