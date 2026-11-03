import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom `text-xxs` size so it isn't mistaken for a text colour and dropped.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["xxs"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
