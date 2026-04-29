import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.id) return false;

      const discordId = profile.id as string;
      const registrationOpen = process.env.ADMIN_REGISTRATION_OPEN === "true";

      if (registrationOpen) {
        await prisma.admin.upsert({
          where: { discordId },
          update: { name: (profile.username as string) ?? "unknown" },
          create: { discordId, name: (profile.username as string) ?? "unknown" },
        });
        return true;
      }

      const admin = await prisma.admin.findUnique({ where: { discordId } });
      return !!admin;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
