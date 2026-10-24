export type Pattern = {
  id: string;
  name: string;
  description: string;
};

export type PatternForm = Pick<Pattern, "name" | "description">;
