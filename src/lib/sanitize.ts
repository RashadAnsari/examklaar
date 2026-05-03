export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify");
  return DOMPurify.sanitize(html);
}
