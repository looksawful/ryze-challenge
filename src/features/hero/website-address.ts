/** Validate an ordinary public website address without requiring a scheme or www. */
export function normalizeWebsiteAddress(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 2048 || /\s|@/.test(value)) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (host.length > 253 || !host.includes(".")) return null;
    const labels = host.split(".");
    if (labels.some(label => !label || label.length > 63 || !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label))) return null;
    if (!/^[a-z]{2,}$|^xn--[a-z\d-]+$/i.test(labels.at(-1) ?? "")) return null;
    return host;
  } catch {
    return null;
  }
}
