"use client";
import Image from "next/image";
import { cn } from "@/utils/classNames";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <>
      <div className="flex px-6 py-6 flex-col items-center justify-center w-full min-h-[calc(100vh-10rem)]">
        <Image
          src="/images/webCrash.png"
          alt="404"
          width={509}
          height={488}
          className="object-contain shrink-0"
        />
        <h1 className="text-lg lg:text-2xl font-semibold my-4 text-black">
          Có lỗi xảy ra. Vui lòng thử lại sau.
        </h1>
        <Link
          href="/"
          className={cn(
            "w-52 h-10 text-base font-semibold",
            "bg-primary text-white hover:bg-primary-secondary/20 hover:text-primary active:bg-primary/80 active:text-white disabled:bg-gray disabled:opacity-60",
            "rounded-lg transition-colors duration-300",
            "flex items-center justify-center gap-2",
          )}
        >
          Quay lại trang chủ
        </Link>
      </div>
    </>
  );
}
