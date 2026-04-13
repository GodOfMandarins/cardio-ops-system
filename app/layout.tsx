import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardio Ops System",
  description: "Ligonines sirdies ligu skyriaus valdymo sistema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
