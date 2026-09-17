import type { Viewport, Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/desktop-manifest.json",
};

export const viewport: Viewport = {
  width: 1280,
  themeColor: "#000000",
};

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
