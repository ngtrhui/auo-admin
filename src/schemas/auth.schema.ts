import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .min(1, "Vui lòng nhập email")
        .email("Email không hợp lệ"),
    password: z.string()
        .trim()
        .refine((val) => val.length > 0,
            { message: "Vui lòng nhập mật khẩu" })
        .refine((val) => val.length >= 8, {
            message: "Mật khẩu phải có ít nhất 8 ký tự",
        }),
});

export type LoginInput = z.infer<typeof loginSchema>;
