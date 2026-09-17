import { NotFoundContent } from "@/components/modules/NotFoundContent";

/** 404 toàn app (vd. /login/xxx) — không có Sidebar. */
export default function GlobalNotFoundPage() {
  return <NotFoundContent />;
}
