import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ALTERNA Light Dashboard",
  description: "ALTERNA投資案件の定点観測ダッシュボード",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased bg-gray-50`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen flex flex-col">
              <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      ALTERNA Dashboard
                    </h1>
                    <ThemeSwitcher />
                  </div>
                </div>
                <Navigation />
              </header>
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                  <p className="text-center text-sm text-gray-500">
                    ALTERNA Light Dashboard - 投資案件定点観測システム
                  </p>
                </div>
              </footer>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
