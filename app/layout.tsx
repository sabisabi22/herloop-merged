import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "herLoop",
  description: "A lifecycle companion app for women's health and benefits",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}