import type { Yarn } from "../components/modules/yarn/yarn.types";

export const YARN_TYPES = ["40s micro", "60s", "100s", "Dệt kim"];

export const INITIAL_YARNS: Yarn[] = [
  {
    id: 1,
    code: "YRN-040M",
    name: "40s micro",
    type: "40s micro",
    patternIds: ["mau-tron"],
    description: "Sợi 40s micro",
  },
  {
    id: 2,
    code: "YRN-060",
    name: "60s",
    type: "60s",
    patternIds: ["mau-tron"],
    description: "Sợi 60s",
  },
  {
    id: 3,
    code: "YRN-100",
    name: "100s",
    type: "100s",
    patternIds: ["mau-tron"],
    description: "Sợi 100s",
  },
  {
    id: 4,
    code: "YRN-KNIT",
    name: "dệt kim",
    type: "Dệt kim",
    patternIds: [],
    description: "Sợi dùng cho sản phẩm dệt kim",
  },
];
