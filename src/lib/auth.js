import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    adapter: FirestoreAdapter({ namingStrategy: "snake_case" }),
    callbacks: {
        async session(session) {
            return session;
        },
        async signIn(user) {
            return true;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
};

export const {
    handlers: { GET, POST },
    auth,
} = NextAuth(authOptions);
