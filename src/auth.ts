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
            },
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
                email: {},
                password: {},
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;

                if (!email || !password) return null;

                const device = deviceHeadersForNodeFetch(
                    await getServerDeviceHeaders()
                );
                const res = await fetch(
                    `${API}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
                    {
                        method: "POST",
                        headers: {
                            "x-locale": getLocale(),
                            "x-device-id": device["x-device-id"],
                            "x-device-name": device["x-device-name"],
                            "x-location": device["x-location"],
                            [X_APP_SCOPE]: APP_SCOPE_ADMIN,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                        credentials: "include",
                    },
                );

                if (!res.ok) {
                    await res.text().catch(() => "");
                    return null;
                }

                const data = await res.json();
                const payload = data?.result ?? data;
                const userRole = payload?.user?.role;
                if (!payload?.user || !payload?.token?.accessToken || !USER_ROLES.includes(userRole as UserRole)) return null;
                return payload;
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user?.token?.accessToken && user.user) {
                const u = user.user;
                token.user = {
                    accountId: u.accountId,
                    email: u.email,
                    role: u.role as UserRole,
                    name: u.name,
                    avatar: u.avatar ?? "",
                };
                token.token = {
                    accessToken: user.token.accessToken,
                    refreshToken: user.token.refreshToken,
                };
                token.accessTokenExp = getTokenExp(user.token.accessToken);
            }

            if (trigger === "update" && session && token.user) {
                const s = session as { user?: { avatar?: string; name?: string } };
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
