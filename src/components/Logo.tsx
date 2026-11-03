import wordmark from "@/assets/loomik-logo.svg?raw";
import icon from "@/assets/loomik-icon.svg?raw";
import { cn } from "@/lib/utils";

// Inline SVG so the logo colours come from the --logo-* tokens.
const Logo = ({ variant = "icon", className }: { variant?: "icon" | "wordmark"; className?: string }) => (
  <span
    role="img"
    aria-label="Loomik"
    className={cn("inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-auto", className)}
    dangerouslySetInnerHTML={{ __html: variant === "icon" ? icon : wordmark }}
  />
);

export default Logo;
