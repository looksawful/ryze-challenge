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
      { id: "marketer", label: "AI Marketer", href: "https://www.get-ryze.ai/", description: "Autonomous campaign management" },
      { id: "muse", label: "Muse", href: "https://www.get-ryze.ai/muse", description: "Marketing intelligence in your AI assistant" },
      { id: "mcp", label: "MCP", href: "https://www.get-ryze.ai/how-to-connect-claude-to-google-meta-ads-mcp", description: "Connect your marketing tools to AI" },
      { id: "integrations", label: "Integrations", href: "https://www.get-ryze.ai/integrations", description: "Connected platforms" },
    ],
  },
  {
    id: "growth",
    label: "Solutions",
    links: [
      { id: "paid-ads", label: "Paid Ads", href: "https://www.get-ryze.ai/", description: "Campaigns and budgets" },
      { id: "seo", label: "SEO & AI visibility", href: "https://www.get-ryze.ai/seo", description: "Search performance" },
      { id: "cro", label: "CRO", href: "https://www.get-ryze.ai/shopify-claude-ai-for-paid-ads-geo-cro", description: "Shopify conversions" },
      { id: "reporting", label: "Reporting", href: "https://help.get-ryze.ai/agent/reports", description: "Performance reports" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    links: [
      { id: "guides", label: "Guides", href: "https://help.get-ryze.ai/", description: "Product documentation" },
      { id: "blog", label: "Blog", href: "https://www.get-ryze.ai/blog", description: "Marketing research and tutorials" },
      { id: "tools", label: "Free tools", href: "https://www.get-ryze.ai/tools", description: "Practical marketing utilities" },
      { id: "changelog", label: "Changelog", href: "https://www.get-ryze.ai/changelog", description: "Product releases" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    links: [],
  },
];

export const headerLinks: readonly SiteDestination[] = [
  { id: "about", label: "About", href: "https://www.get-ryze.ai/about" },
];

/** Current monthly prices published by Ryze; no derived or inferred tiers. */
export const pricingPlans = [
  { id: "paid-ads-plan", label: "Paid Ads Autopilot", price: 89, href: "https://www.get-ryze.ai/pricing", description: "AI ad management" },
  { id: "seo-plan", label: "SEO Autopilot", price: 129, href: "https://www.get-ryze.ai/pricing", description: "SEO and AI search" },
  { id: "traffic-plan", label: "Traffic Printer", price: 599, href: "https://www.get-ryze.ai/pricing", description: "Full-service SEO and GEO" },
  { id: "ecom-plan", label: "Ecom Autopilot", price: 1499, href: "https://www.get-ryze.ai/pricing", description: "E-commerce growth" },
] as const;

export const bookingLink: SiteDestination = {
  id: "book-call",
  label: "Book a call",
  href: "https://ryze.cal.com/hello/partner-program",
};

export const footerGroups: readonly DestinationGroup[] = [
  { id: "company", label: "Company", links: [
    { id: "footer-about", label: "About", href: "https://www.get-ryze.ai/about" },
    { id: "footer-customers", label: "Customer stories", href: "https://www.get-ryze.ai/customers" },
    { id: "footer-contact", label: "Contact", href: "mailto:hello@get-ryze.ai" },
  ] },
  { id: "product", label: "Product", links: [
    { id: "footer-marketer", label: "AI Marketer", href: "https://www.get-ryze.ai/" },
    { id: "footer-muse", label: "Muse", href: "https://www.get-ryze.ai/muse" },
    { id: "footer-pricing", label: "Pricing", href: "https://www.get-ryze.ai/pricing" },
  ] },
  { id: "resources", label: "Resources", links: [
    { id: "footer-guides", label: "Guides", href: "https://help.get-ryze.ai/" },
    { id: "footer-blog", label: "Blog", href: "https://www.get-ryze.ai/blog" },
    { id: "footer-tools", label: "Free tools", href: "https://www.get-ryze.ai/tools" },
    { id: "footer-changelog", label: "Changelog", href: "https://www.get-ryze.ai/changelog" },
  ] },
  { id: "legal", label: "Legal", links: [
    { id: "footer-privacy", label: "Privacy", href: "https://www.get-ryze.ai/privacy" },
    { id: "footer-terms", label: "Terms", href: "https://www.get-ryze.ai/terms-of-use" },
    { id: "footer-refund", label: "Refund policy", href: "https://www.get-ryze.ai/refund-policy" },
  ] },
  { id: "explore", label: "Explore", links: [
    { id: "footer-seo", label: "SEO & GEO", href: "https://www.get-ryze.ai/seo" },
    { id: "footer-ai", label: "AI visibility", href: "https://www.get-ryze.ai/ai-visibility-tool" },
    { id: "footer-integrations", label: "Integrations", href: "https://www.get-ryze.ai/integrations" },
    { id: "footer-agency", label: "Agency", href: "https://www.get-ryze.ai/agency" },
  ] },
];

// Mobile global navigation: the current product is Shopify Autopilot; all
// other products are one tap away once the upper hamburger is open.
// The mobile menu shares the same product and resource data as desktop.
// Solution screenshot cards appear exactly once in their own scrollable rail.
export const mobileSiteSections: readonly DestinationGroup[] = [
  navigationGroups[0],
  navigationGroups[2],
  { id: "mobile-company", label: "Company", links: [headerLinks[0]] },
];

export const shopifyPricingHref = "https://www.get-ryze.ai/pricing";
export const shopifyStartHref = "https://reports.get-ryze.ai/o/all";

export function previewNotice(destination: SiteDestination): string {
  return `On the live site, ${destination.label} would open ${destination.href}; this preview stays on the same page.`;
}

export type NavigationProduct = SiteDestination & Readonly<{
  image: string;
  width: number;
  height: number;
}>;

// Original Ryze interface screenshots from the first approved Homework menu.
// Reused by desktop MegaMenu and mobile product navigation.
export const navigationProductCards: readonly NavigationProduct[] = [
  {
    id: "paid-ads-card",
    label: "Paid Ads",
    href: "https://www.get-ryze.ai/",
    description: "Campaigns, creatives and budget optimization.",
    image: "/ryze-media/navigation/paid-ads-walkthrough.webp", width: 1920, height: 1080,
  },
  {
    id: "seo-card",
    label: "SEO & AI Visibility",
    href: "https://www.get-ryze.ai/seo",
    description: "Search rankings, content and AI citations.",
    image: "/ryze-media/navigation/seo.webp", width: 1920, height: 1080,
  },
  {
    id: "cro-card",
    label: "CRO",
    href: "https://www.get-ryze.ai/shopify-claude-ai-for-paid-ads-geo-cro",
    description: "Product pages, experiments and conversion.",
    image: "/ryze-media/navigation/site-audit.webp", width: 1920, height: 1080,
  },
  {
    id: "reporting-card",
    label: "Reporting",
    href: "https://help.get-ryze.ai/agent/reports",
    description: "Performance, attribution and weekly summaries.",
    image: "/ryze-media/navigation/reporting.webp", width: 1920, height: 1080,
  },
];
