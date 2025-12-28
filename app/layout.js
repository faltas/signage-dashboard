import "./globals.css";

export const metadata = {
  title: "Signage Cloud Dashboard",
  description: "Controllo cloud dei display digital signage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
  );
}
