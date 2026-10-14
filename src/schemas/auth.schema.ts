import { z } from "zod";

export const loginSchema = z.object({
    phone: z.string()
        .trim()
        .min(1, "Vui lòng nhập số điện thoại"),

    password: z.string()
        .trim()
        .min(1, "Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;