import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginUser } from "@/app/actions/user";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            async authorize(credentials) {
                try {
                    const user = await loginUser(credentials);
                    if (!user) {
                        throw new Error("Login failed");
                    }
                    const userData = {
                        id: user.user.uid,
                        email: user.user.email,
                        name: user.user.name,
                        image: user.user.image,
                        isProfileComplete: user.user.isProfileComplete,
                    };
                    return userData;
                } catch (error) {
                    throw new Error(error.message);
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    adapter: FirestoreAdapter({ namingStrategy: "snake_case" }),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn(user) {
            return true;
        },
        async session({ session, token }) {
            session.user.id = token.sub;
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        signup: "/auth/signup",
        error: "/auth/signin",
    },
};

export const {
    handlers: { GET, POST },
    auth,
} = NextAuth(authOptions);
