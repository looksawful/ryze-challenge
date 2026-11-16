import type { Metadata } from "next";
import "./foundation.css";

export const metadata: Metadata = {
  title: "Ryze — AI autopilot for your Shopify",
  description: "A new way to grow your store.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body data-theme="dawn">{children}</body>
    </html>
  );
}
