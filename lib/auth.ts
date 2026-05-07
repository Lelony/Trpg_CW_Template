// lib/auth.ts
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUsers } from './github';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        id:       { label: '아이디', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) return null;

        const users = await getUsers();
        const user  = users.find((u: any) => u.id === credentials.id);
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return { id: user.id, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    // role을 JWT에 포함
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    // JWT → Session 전파
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: { strategy: 'jwt' },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);