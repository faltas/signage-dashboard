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
