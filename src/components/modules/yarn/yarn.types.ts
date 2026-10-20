export type Yarn = {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
};

export type YarnForm = Omit<Yarn, "id">;
