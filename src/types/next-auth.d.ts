import NextAuth from "next-auth";
import { UserRole } from "./user";
import { OAuthProvider } from "next-auth/providers";

declare module "next-auth" {
    interface Session {
        user: {
            accountId: string;
            email: string;
            role: UserRole;
            name: string;
            avatar: string;
        };
        provider?: {
            provider?: OAuthProvider;
            providerUserId?: string;
        };
        token: {
            accessToken: string;
            refreshToken: string;
        }
        error?: string;
    }

    /** OAuth: id/name/email/image. Credentials authorize: thêm user + token */
    interface User {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        user?: {
            id: string;
            name: string;
            avatar?: string;
            accountId: string;
            email: string;
            role: string;
            profileId: string;
        };
        token?: {
            accessToken: string;
            refreshToken: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: {
            accountId: string;
            email: string;
            role: UserRole;
            name: string;
            avatar: string;
        };
        provider?: {
            provider?: OAuthProvider;
            providerUserId?: string;
        };
        token: {
            accessToken: string;
            refreshToken: string;
        }
    }
}