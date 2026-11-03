// Shared visual rules. Components import these instead of picking colours themselves,
// so every screen follows the same logic and only semantic tokens are used.

// Scores (win %, alignment, etc.) stay neutral; only at-risk values are highlighted.
export const RISK_THRESHOLD = 50;

const isAtRisk = (value: number) => value < RISK_THRESHOLD;

/** Text colour for a score value. */
export const scoreText = (value: number) => (isAtRisk(value) ? "text-danger" : "text-foreground");

/** Fill colour for a progress bar. */
export const scoreFill = (value: number) => (isAtRisk(value) ? "bg-danger" : "bg-primary");

/** Raw colour for charts / SVG (donuts, gauges). */
export const scoreColor = (value: number) => (isAtRisk(value) ? "hsl(var(--danger))" : "hsl(var(--primary))");

/** Text colour for a change / delta (e.g. ↑5%). */
export const trendText = (change: number) =>
  change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-muted-foreground";

type Sentiment = "positive" | "neutral" | "negative";

/** Subtle badge for a stakeholder sentiment / status. */
export const sentimentBadge = (status: Sentiment) =>
  ({
    positive: "bg-success-subtle text-success",
    neutral: "bg-muted text-muted-foreground",
    negative: "bg-danger-subtle text-danger",
  })[status] ?? "bg-muted text-muted-foreground";

/** Small dot for a sentiment / status. */
export const sentimentDot = (status: Sentiment) =>
  ({ positive: "bg-success", neutral: "bg-muted-foreground", negative: "bg-danger" })[status] ?? "bg-muted-foreground";

/** Small dot marking priority (replaces tinted rows and coloured borders). */
export const priorityDot = (priority: string) =>
  ({ high: "bg-danger", medium: "bg-warning", low: "bg-muted-foreground" })[priority.toLowerCase()] ?? "bg-muted-foreground";

/** Neutral badge for categories / tags (asset type, value primitive, division...). */
export const categoryBadge = "bg-muted text-muted-foreground";

/** Fallback avatar (initials). */
export const avatarFallback = "bg-primary-subtle text-primary";

/** Selected state for filter chips, tabs and segmented controls. */
export const selectedChip = "bg-primary-subtle text-primary";
export const unselectedChip = "text-muted-foreground hover:bg-muted hover:text-foreground";
