export type Yarn = {
  id: number;
  code: string;
  name: string;
  type: string;
  patternType: YarnPatternType[];
  description: string;
};

export type YarnPatternType = "Mẫu trơn" | "Mẫu họa tiết";

export type YarnForm = Omit<Yarn, "id">;
