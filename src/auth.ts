
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import { USER_ROLES, type UserRole } from "@/types/user";
import Credentials from "next-auth/providers/credentials";
import { API_CONFIG } from "./config/api-config";
import { jwtDecode } from "jwt-decode";
import { getLocale } from "./utils/helper";
import { encodeHeaderValueForHttp } from "./lib/http-header-value";
import { getServerDeviceHeaders } from "./lib/server-device";
import { APP_SCOPE_ADMIN, X_APP_SCOPE } from "./lib/api-scope";

// Dùng INTERNAL_URL cho server-side calls (trong Docker container)
const API = API_CONFIG.INTERNAL_URL;

function deviceHeadersForNodeFetch(
    d: Awaited<ReturnType<typeof getServerDeviceHeaders>>
) {
    return {
        "x-device-id": encodeHeaderValueForHttp(d["x-device-id"]),
        "x-device-name": encodeHeaderValueForHttp(d["x-device-name"]),
        "x-location": encodeHeaderValueForHttp(d["x-location"]),
    };
}

function getTokenExp(token: string) {
    try {
        const decoded: any = jwtDecode(token);
        console.log("[NextAuth] Decoded Token Payload:", decoded);
        return decoded.exp * 1000;
    } catch {
        return null;
    }
}

async function refreshAccessToken(token: any) {
    try {
        const device = await getServerDeviceHeaders();
        const d = deviceHeadersForNodeFetch(device);
        const res = await fetch(
            `${API}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-locale": getLocale(),
                    "x-device-id": d["x-device-id"],
                    "x-device-name": d["x-device-name"],
                    "x-location": d["x-location"],
                    [X_APP_SCOPE]: APP_SCOPE_ADMIN,
                },
                body: JSON.stringify({
                    refreshToken: token.token?.refreshToken,
                }),
            }
        );

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        const payload = data?.result ?? data;

        console.log("[NextAuth] Refresh Access Token - Data:", data);
        console.log("[NextAuth] Refresh Access Token - Payload:", payload);
        return {
            ...token,
            accessTokenExp: getTokenExp(payload.accessToken),
            token: {
                accessToken: payload.accessToken,
                refreshToken: payload.refreshToken,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            ...token,
            token: { accessToken: "", refreshToken: "" },
            accessTokenExp: 0,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            credentials: {
                phone: {},
                password: {},
            },

            async authorize(credentials) {
                const phone = credentials?.phone;
                const password = credentials?.password;

                if (!phone || !password) return null;

                const device = deviceHeadersForNodeFetch(
                    await getServerDeviceHeaders()
                );

                const url = `${API}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`;
                const body = { phone, password };

                console.log("[NextAuth] Login URL:", url);
                console.log("[NextAuth] Login Payload:", {
                    phone,
                    password: "[REDACTED]",
                });

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "x-locale": getLocale(),
                        "x-device-id": device["x-device-id"],
                        "x-device-name": device["x-device-name"],
                        "x-location": device["x-location"],
                        [X_APP_SCOPE]: APP_SCOPE_ADMIN,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                console.log("[NextAuth] Login Status:", res.status);

                if (!res.ok) {
                    const errorText = await res.text().catch(() => "");
                    console.error("[NextAuth] Login Error:", errorText);
                    return null;
                }

                const response = await res.json();
                const payload = response?.data;

                const user = payload?.user;
                const accessToken = payload?.accessToken;
                const refreshToken = payload?.refreshToken;

                // const normalizedRole =
                //     user?.role === "ADMIN" ? "Admin" : user?.role;

                const normalizedRole = USER_ROLES.find(
                    (role) =>
                        String(role).toUpperCase() ===
                        String(user?.role ?? "").toUpperCase()
                );

                if (
                    response?.success !== true ||
                    !user ||
                    !accessToken ||
                    !USER_ROLES.includes(normalizedRole as UserRole)
                ) {
                    console.error(
                        "[NextAuth] Invalid login response structure:",
                        {
                            success: response?.success,
                            hasUser: Boolean(user),
                            hasAccessToken: Boolean(accessToken),
                            role: user?.role,
                        }
                    );

                    return null;
                }

                return {
                    id: String(user.idUser),
                    profileId: String(user.profileId ?? user.idUser),
                    accountId: String(user.idUser),
                    email: user.email,
                    role: normalizedRole as UserRole,
                    name: user.fullName,
                    avatar: user.avatar ?? "",
                    token: {
                        accessToken,
                        refreshToken,
                    },
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user?.token?.accessToken) {
                const authUser = user as typeof user & {
                    accountId: string;
                    email?: string | null;
                    role: UserRole;
                    name?: string | null;
                    avatar?: string;
                    token: {
                        accessToken: string;
                        refreshToken: string;
                    };
                };

                token.user = {
                    accountId: authUser.accountId,
                    email: authUser.email ?? "",
                    role: authUser.role,
                    name: authUser.name ?? "",
                    avatar: authUser.avatar ?? "",
                };

                token.token = {
                    accessToken: authUser.token.accessToken,
                    refreshToken: authUser.token.refreshToken,
                };

                token.accessTokenExp = getTokenExp(
                    authUser.token.accessToken
                );
            }

            if (trigger === "update" && session && token.user) {
                const s = session as {
                    user?: { avatar?: string; name?: string };
                };

                if (s.user) {
                    if (s.user.avatar !== undefined) {
                        token.user.avatar = s.user.avatar;
                    }

                    if (s.user.name !== undefined) {
                        token.user.name = s.user.name;
                    }
                }
            }

            const now = Date.now();
            const expireTime = token.accessTokenExp as number ?? 0;

            if (now < expireTime) {
                return token;
            }

            return await refreshAccessToken(token);
        },

        async signIn({ user, account }) {
            if (account?.provider === "credentials") {
                if (!user.token?.accessToken) return false;
                return true;
            }

            return true;
        },

        async session({ session, token }) {
            session.user = token.user;
            session.token = token.token as {
                accessToken: string;
                refreshToken: string;
            };
            session.error = token.error as string | undefined;

            console.log("[NextAuth] token Callback:", token);

            return session;
        },

        async redirect({ url, baseUrl }) {
            if (url.includes("error")) {
                return baseUrl;
            }

            return url;
        },
    },

    pages: {
        signIn: "/",
        signOut: "/login",
        error: "/",
    },
};