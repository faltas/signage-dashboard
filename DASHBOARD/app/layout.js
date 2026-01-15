import "./globals.css";
import { SupabaseProvider } from "./providers";
import { LanguageProvider } from "./language-provider";

export const metadata = {
  title: "Signage Cloud Dashboard",
  description: "Controllo cloud dei display digital signage",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen font-sans">
        <SupabaseProvider>
          <LanguageProvider>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </LanguageProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
