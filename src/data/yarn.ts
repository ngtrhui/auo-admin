import type { Yarn } from "../components/modules/yarn/yarn.types";

export const YARN_TYPES = ["40s micro", "60s", "100s", "Dệt kim"];

export const INITIAL_YARNS: Yarn[] = [
  {
    id: 1,
    code: "YRN-040M",
    name: "Chất liệu 40s micro",
    type: "40s micro",
    description: "Sợi 40s micro",
  },
  {
    id: 2,
    code: "YRN-060",
    name: "Chất liệu 60s",
    type: "60s",
    description: "Sợi 60s",
  },
  {
    id: 3,
    code: "YRN-100",
    name: "Chất liệu 100s",
    type: "100s",
    description: "Sợi 100s",
  },
  {
    id: 4,
    code: "YRN-KNIT",
    name: "Chất liệu dệt kim",
    type: "Dệt kim",
    description: "Sợi dùng cho sản phẩm dệt kim",
  },
];
