import type { Metadata } from "next";
import "./foundation.css";

export const metadata: Metadata = {
  title: "Interface preview",
  description: "Static-first interactive frontend",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body data-theme="dawn">{children}</body>
    </html>
  );
}
