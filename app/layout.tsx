import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { WebVitalsTracker } from "@/components/monitoring/web-vitals";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Volo - Learn Liberian Languages",
  description: "Learn Liberian local languages through interactive lessons, stories, and exercises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ErrorBoundary>
            <WebVitalsTracker />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

