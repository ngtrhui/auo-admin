"use client";

import Image from "next/image";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FaXmark } from "react-icons/fa6";
import { cn } from "@/utils/classNames";

type ToastType = "success" | "error" | "warning" | "info";

const TOAST_CONFIG: Record<
  ToastType,
  { icon: string; bg: string; closeBg: string }
> = {
  success: {
    icon: "/images/icons/icon_check.webp",
    bg: "#E6F7F1",
    closeBg: "transparent",
  },
  warning: {
    icon: "/images/icons/icon_warning.webp",
    bg: "#FFF3E7",
    closeBg: "transparent",
  },
  error: {
    icon: "/images/icons/icon_disable.webp",
    bg: "#FFD6D6",
    closeBg: "#FFADAD",
  },
  info: {
    icon: "/images/icons/icon_bellX.webp",
    bg: "#FFFFFF",
    closeBg: "#F3F2F2",
  },
};

function CustomToaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true
      }}
    />
  );
}

function showToast(
  type: ToastType,
  message: string,
  customDuration: number = 2500
) {
  const config = TOAST_CONFIG[type];

  toast.custom(
    (id) => (
      <div
        className={cn("flex max-w-[90vw] w-[360px] items-center gap-3 rounded-lg border border-black/5 px-4 py-3 shadow-md",
          "animate-fade-in",
        )}
        style={{ backgroundColor: config.bg }}
      >
        <Image
          src={config.icon}
          alt={type}
          width={24}
          height={24}
          className="shrink-0"
          unoptimized
        />
        <span className="flex-1 whitespace-pre-line text-sm font-semibold text-black">
          {message}
        </span>
        <Button
          variant="transparent"
          size="sm"
          className="min-h-5 h-5 w-5 p-1 shrink-0 rounded-sm text-gray hover:text-black"
          style={{ backgroundColor: config.closeBg }}
          onClick={() => {
            toast.dismiss(id);
          }}
        >
          <FaXmark className="text-base" />
        </Button>
      </div>
    ),
    {
      duration: customDuration,
    }
  );
}

export { CustomToaster, showToast };
