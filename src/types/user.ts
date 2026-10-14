/** Danh sách role hợp lệ — dùng cho runtime (proxy, middleware) và suy ra type. */
export const USER_ROLES = ["ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
    idUser: string;
    email: string;
    phone: string;
    role: UserRole;
    fullName: string;
    avatar: string;
    profileId: string;
    gender: string;
    status:string;
}