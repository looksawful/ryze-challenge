import { notFound } from "next/navigation";
import IntegrationVariantSite from "@/features/integrations/IntegrationVariantSite";

export const dynamicParams = false;

const OPTIONS = {
  "a-right": { layout: "single", caption: "right" },
  "a-below": { layout: "single", caption: "below" },
  "b-right": { layout: "wrap", caption: "right" },
  "b-below": { layout: "wrap", caption: "below" },
} as const;

export function generateStaticParams() {
  return Object.keys(OPTIONS).map((combination) => ({ combination }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ combination: string }>;
}) {
  const { combination } = await params;
  const option = OPTIONS[combination as keyof typeof OPTIONS];
  if (!option) notFound();
  return <IntegrationVariantSite layout={option.layout} caption={option.caption} />;
}
