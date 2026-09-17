import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Plug In",
  description: "Your personal music hub",
  applicationName: "Plug In",
  appleWebApp: {
    capable: true,
    title: "Plug In",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
