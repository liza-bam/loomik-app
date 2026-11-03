import { cn } from "@/lib/utils";
import { expect, test } from "vitest";
test("xxs survives a colour", () => { expect(cn("text-xxs", "text-primary")).toBe("text-xxs text-primary"); });
test("sizes still merge", () => { expect(cn("text-xxs", "text-sm")).toBe("text-sm"); });
