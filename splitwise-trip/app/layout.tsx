import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Trip Split",
  description: "Split expenses with Mike, Mau & Villalon",
};

export const viewport: Viewport = {
  themeColor: "#1CC29F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col">
          <TopBar />
          <main className="flex-1 pb-28">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
