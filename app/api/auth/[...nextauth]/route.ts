import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const { handlers } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
  ],
  // Optional: Add a secret if you haven't yet
  secret: process.env.AUTH_SECRET,
});

export const { GET, POST } = handlers