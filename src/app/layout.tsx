import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RootLink",
  description: "RootLink V1 family digital memory platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
