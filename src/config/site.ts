/**
 * Everything that identifies the product lives here, so renaming it, moving it
 * to another domain, or changing the contact link is a single-file change.
 * Metadata, structured data, the navbar, the footer and the emails all read
 * from this object rather than hardcoding a name, a URL, or a colour.
 *
 * Legal copy is deliberately left alone: the privacy and terms pages
 * name the product inside sentences that also carry legal meaning, and those
 * are edited as prose, not templated.
 */
export const site = {
  name: "ExamKlaar",
  /** Used in <title> templates and as the marketing headline suffix. */
  tagline: "Practice for Your Dutch Inburgering Exam",
  /** Canonical origin, no trailing slash. Used by metadata, sitemap, and robots. */
  url: "https://examklaar.nl",
  /** The public source repository, linked from the footer. */
  repoUrl: "https://github.com/RashadAnsari/examklaar",
  /** Where users ask questions and send requests; there is no support email. */
  issuesUrl: "https://github.com/RashadAnsari/examklaar/issues",
  /** Brand colour, mirrored by --green-900 in globals.css. Emails cannot read CSS variables. */
  brandColor: "#1b6b4a",
} as const;
