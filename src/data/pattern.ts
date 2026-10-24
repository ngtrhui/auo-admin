import type { Pattern } from "@/components/modules/pattern/pattern.types";

export const INITIAL_PATTERNS: Pattern[] = [
  {
    id: "mau-tron",
    name: "Mẫu trơn",
    description: "",
  },
  {
    id: "mau-hoa-tiet",
    name: "Mẫu họa tiết",
    description: "",
  },
];

export const PATTERNS_STORAGE_KEY = "auo-admin-patterns";
export const LEGACY_PATTERNS_STORAGE_KEY = "auo-admin-yarn-pattern-types";
