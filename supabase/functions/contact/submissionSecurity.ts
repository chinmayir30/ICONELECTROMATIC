export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (!origin || !allowedOrigins.includes(origin)) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.origin === origin;
  } catch { return false; }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export function isValidHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch { return false; }
}

export function safeEmailHeader(value: string): string {
  return value.replace(/[\\r\\n\\u0000-\\u001f\\u007f]+/g, " ").trim().slice(0, 160);
}
