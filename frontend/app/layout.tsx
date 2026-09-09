import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Croissant",
  description: "Multilingual storefront starter for Croissant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
