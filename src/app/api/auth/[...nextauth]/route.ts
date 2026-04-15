import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Tizim Paroli",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parol", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Faqat bazadagi foydalanuvchilar parol bilan kira oladi
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', credentials.email)
          .maybeSingle();

        if (profile && profile.password === credentials.password) {
          return { id: profile.id || "1", name: profile.full_name || "Foydalanuvchi", email: profile.email, image: profile.avatar_url || "" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn() {
      // Google orqali hamma kira oladi (mehmonlar ham), Credentials orqali esa faqat bazadagilar
      return true;
    },
    async jwt({ token, account }) {
      // Provider ma'lumotini tokenga saqlash (faqat birinchi signin paytida account mavjud)
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Provider ma'lumotini sessionga uzatish
      (session as any).provider = token.provider;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
