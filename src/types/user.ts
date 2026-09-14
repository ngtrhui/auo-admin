/** Danh sách role hợp lệ — dùng cho runtime (proxy, middleware) và suy ra type. */
export const USER_ROLES = ["Admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
    accountId: string;
    email: string;
    role: UserRole;
    name: string;
    avatar: string;
    profileId: string;
}