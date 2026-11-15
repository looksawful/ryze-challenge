import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interface preview",
  description: "Static-first interactive frontend",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
