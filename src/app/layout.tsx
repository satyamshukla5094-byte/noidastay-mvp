import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@/lib/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NoidaStay - Verified PG Accommodations in Greater Noida",
  description: "Find verified PG accommodations with escrow protection, digital agreements, and instant booking in Greater Noida near NIET, Galgotias, and other colleges.",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NoidaStay",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userInitials: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ||
        `${user.user_metadata?.first_name ?? ""} ${user.user_metadata?.last_name ?? ""}`.trim();
      if (fullName) {
        const parts = fullName.split(" ").filter(Boolean);
        userInitials =
          parts.length === 1
            ? parts[0]!.charAt(0).toUpperCase()
            : `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
      } else if (user.email) {
        userInitials = user.email.charAt(0).toUpperCase();
      }
    }
  } catch {
    // In unauthenticated or misconfigured envs, just render without initials.
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NoidaStay" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Analytics />
        <TooltipProvider>
          <Navbar />
          <div className="pb-16 md:pb-0">{children}</div>
          <BottomNav userInitials={userInitials} />
        </TooltipProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
