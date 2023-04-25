import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export type Token = JWT & {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
};

export type Jwt = {
  token: Token;
  account: Account | null;
};

const refreshAccessToken = async (token: Token) => {
  try {
    const refreshToken = token.refresh_token || "";

    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const url = "https://oauth2.googleapis.com/token?" + searchParams;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedToken = await response.json();

    if (!response.ok) {
      throw refreshedToken;
    }

    return {
      ...token,
      access_token: refreshedToken.access_token,
      expires_at: Math.floor(Date.now() / 1000 + refreshedToken.expires_in),
      refresh_token: refreshedToken.refresh_token ?? token.refresh_token,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: { params: { access_type: "offline", prompt: "consent" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: Jwt) {
      // Initial login
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.expires_at && Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Return previous token if the access token has not expired yet
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.access_token,
        error: token.error,
      };
    },
  },
  secret: process.env.JWT_SECRET,
};

export { authOptions };

export default NextAuth(authOptions);
