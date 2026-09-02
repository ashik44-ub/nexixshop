import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Webpack & ESM Resolution Fix
const nextAuthHandler = NextAuth.default || NextAuth;

const handler = (req, ctx) => nextAuthHandler(authOptions)(req, ctx);

export { handler as GET, handler as POST };