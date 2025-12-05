import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const identifier = credentials.username;

                // 1. Check if it's an Admin (by username)
                const admin = await prisma.admin.findUnique({
                    where: { username: identifier },
                });

                if (admin) {
                    const isPasswordValid = await compare(
                        credentials.password,
                        admin.password_hash
                    );
                    if (isPasswordValid) {
                        return {
                            id: admin.id,
                            name: admin.username,
                            email: admin.username,
                            role: admin.role,
                        };
                    }
                }

                // 2. Check if it's a User (by email)
                const user = await prisma.user.findUnique({
                    where: { email: identifier },
                });

                if (user && user.password_hash) {
                    const isPasswordValid = await compare(
                        credentials.password,
                        user.password_hash
                    );
                    if (isPasswordValid) {
                        return {
                            id: user.id,
                            name: user.full_name || user.email,
                            email: user.email,
                            role: "customer",
                        };
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-development-only-change-in-production",
};
