import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "23 en voie",
  description: "Multilingual storefront starter for 23 en voie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
