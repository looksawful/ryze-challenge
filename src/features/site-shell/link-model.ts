export type SiteDestination = Readonly<{
  id: string;
  label: string;
  href: string;
  description?: string;
}>;

export type DestinationGroup = Readonly<{
  id: string;
  label: string;
  links: readonly SiteDestination[];
}>;

// URL inventory verified against the public Shopify product landing page.
// Labels and grouping below are the RYZE preview's own interface taxonomy.
export const navigationGroups: readonly DestinationGroup[] = [
  {
    id: "products",
    label: "Products",
    links: [
      { id: "marketer", label: "AI Marketer", href: "https://www.get-ryze.ai/", description: "Ads, SEO and site management" },
      { id: "muse", label: "Muse", href: "https://www.get-ryze.ai/muse", description: "Explore Muse" },
      { id: "shopify", label: "Shopify CRO", href: "https://www.get-ryze.ai/shopify-claude-ai-for-paid-ads-geo-cro", description: "Store growth and conversion" },
    ],
  },
  {
    id: "growth",
    label: "Solutions",
    links: [
      { id: "paid-ads", label: "Paid Ads", href: "https://www.get-ryze.ai/#ai-marketer", description: "Campaign optimization" },
      { id: "seo", label: "SEO", href: "https://www.get-ryze.ai/seo", description: "Organic search" },
      { id: "ai-visibility", label: "AI visibility", href: "https://www.get-ryze.ai/ai-visibility-tool", description: "Discoverability in AI search" },
      { id: "geo", label: "GEO", href: "https://www.get-ryze.ai/geo-tool", description: "Generative search visibility" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    links: [
      { id: "mcp", label: "MCP", href: "https://www.get-ryze.ai/how-to-connect-claude-to-google-meta-ads-mcp", description: "Connect Claude to your ad tools" },
      { id: "integrations", label: "Integrations", href: "https://www.get-ryze.ai/integrations", description: "Available connections" },
      { id: "docs", label: "Docs", href: "https://help.get-ryze.ai/", description: "Help and documentation" },
      { id: "changelog", label: "Changelog", href: "https://www.get-ryze.ai/changelog", description: "Recent updates" },
    ],
  },
];

export const headerLinks: readonly SiteDestination[] = [
  // Header uses /payment-setup; footer links to /pricing. Preserve the real discrepancy.
  { id: "pricing-header", label: "Pricing", href: "https://www.get-ryze.ai/payment-setup" },
  { id: "about", label: "About", href: "https://www.get-ryze.ai/about" },
];

export const bookingLink: SiteDestination = {
  id: "book-call",
  label: "Book a call",
  href: "https://ryze.cal.com/hello/partner-program",
};

export const footerGroups: readonly DestinationGroup[] = [
  {
    id: "product",
    label: "Product",
    links: [
      { id: "footer-marketer", label: "AI Marketer", href: "https://www.get-ryze.ai/" },
      { id: "footer-muse", label: "Muse", href: "https://www.get-ryze.ai/muse" },
      { id: "footer-shopify", label: "Shopify CRO", href: "https://www.get-ryze.ai/shopify-claude-ai-for-paid-ads-geo-cro" },
      { id: "pricing-footer", label: "Pricing", href: "https://www.get-ryze.ai/pricing" },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    links: [
      { id: "footer-paid-ads", label: "Paid Ads", href: "https://www.get-ryze.ai/#ai-marketer" },
      { id: "footer-seo", label: "SEO", href: "https://www.get-ryze.ai/seo" },
      { id: "footer-ai", label: "AI visibility", href: "https://www.get-ryze.ai/ai-visibility-tool" },
      { id: "footer-geo", label: "GEO", href: "https://www.get-ryze.ai/geo-tool" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    links: [
      { id: "ai-seo-tool", label: "AI SEO tool", href: "https://www.get-ryze.ai/ai-seo-tool" },
      { id: "geo-tool", label: "GEO tool", href: "https://www.get-ryze.ai/geo-tool" },
      { id: "organic-dropshipping", label: "Organic AI dropshipping", href: "https://www.get-ryze.ai/organic-ai-dropshipping" },
      { id: "integration-list", label: "Integrations", href: "https://www.get-ryze.ai/integrations" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    links: [
      { id: "help", label: "Docs", href: "https://help.get-ryze.ai/" },
      { id: "compare", label: "Compare", href: "https://www.get-ryze.ai/compare" },
      { id: "claude", label: "Connect Claude", href: "https://www.get-ryze.ai/how-to-connect-claude-to-google-ads" },
      { id: "updates", label: "Changelog", href: "https://www.get-ryze.ai/changelog" },
      { id: "ai-info", label: "AI Info", href: "https://www.get-ryze.ai/ai-info" },
    ],
  },
  {
    id: "company",
    label: "Company",
    links: [
      { id: "company-about", label: "About", href: "https://www.get-ryze.ai/about" },
      { id: "affiliates", label: "Affiliates", href: "https://www.get-ryze.ai/affiliate-program" },
      { id: "white-label", label: "White label", href: "https://www.get-ryze.ai/white-label" },
      { id: "security", label: "Security", href: "https://www.get-ryze.ai/security-policy" },
      { id: "contact", label: "Contact", href: "mailto:hello@get-ryze.ai" },
    ],
  },
  {
    id: "legal",
    label: "Legal",
    links: [
      { id: "privacy", label: "Privacy", href: "https://www.get-ryze.ai/privacy" },
      { id: "terms", label: "Terms", href: "https://www.get-ryze.ai/terms-of-use" },
      { id: "refund", label: "Refund policy", href: "https://www.get-ryze.ai/refund-policy" },
      { id: "sms", label: "SMS opt-in", href: "https://www.get-ryze.ai/sms-optin" },
    ],
  },
];

export function previewNotice(destination: SiteDestination): string {
  return `On the live site, ${destination.label} would open ${destination.href}; this preview stays on the same page.`;
}
