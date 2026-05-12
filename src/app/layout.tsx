import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Platform",
  description: "범용 예약 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
