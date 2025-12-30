import "./globals.css";
import { SupabaseProvider } from "./providers";

export const metadata = {
  title: "Signage Cloud Dashboard",
  description: "Controllo cloud dei display digital signage",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-slate-50">
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
