"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toaster";
import { getErrorMessage } from "@/utils/helper";

const LOGIN_SUCCESS_TOAST_MS = 1500;

const LoginPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      showToast(
        "error",
        getErrorMessage(result.error, "Email hoặc mật khẩu không đúng"),
      );
      return;
    }

    if (!result?.ok) {
      showToast("error", "Đăng nhập thất bại. Vui lòng thử lại.");
      return;
    }

    showToast("success", "Đăng nhập thành công");
    await new Promise((resolve) => setTimeout(resolve, LOGIN_SUCCESS_TOAST_MS));
    router.replace("/");
    router.refresh();
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/images/bgLogin.png')" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[980px] items-center justify-center">
        <div className="w-full max-w-[640px]">
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo/auo_logo.png"
              alt="Ầu Ơ logo"
              width={132}
              height={54}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          <div className="rounded-xl bg-white/95 p-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-black">
                Chào mừng bạn trở lại!
              </h1>
              <p className="mt-1 text-base text-gray">Đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                {...register("email")}
                type="email"
                label="Email"
                placeholder="Email của bạn"
                variant="standard"
                autoComplete="email"
                fullWidth
                disabled={isSubmitting}
                className="text-sm"
                error={errors.email?.message}
              />

              <PasswordInput
                {...register("password")}
                label="Mật khẩu"
                placeholder="Mật khẩu của bạn"
                variant="standard"
                autoComplete="current-password"
                fullWidth
                disabled={isSubmitting}
                className="text-sm"
                error={errors.password?.message}
              />

              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Đăng nhập
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
