"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/classNames";

export function NotFoundContent() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-6 py-6">
      <Image
        src="/images/404.png"
        alt="404"
        width={509}
        height={488}
        className="shrink-0 object-contain"
      />
      <h1 className="my-4 text-2xl font-semibold text-gray/80">
        Không tìm thấy trang. Vui lòng thử lại sau.
      </h1>
      <Link
        href="/"
        className={cn(
          "flex h-10 w-52 items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors duration-300",
          "bg-primary text-white hover:bg-primary-secondary/20 hover:text-primary active:bg-primary/80 active:text-white",
        )}
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
