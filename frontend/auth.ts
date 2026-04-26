import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Add providers here later, e.g., GitHub, Google, Credentials
  ],
});
