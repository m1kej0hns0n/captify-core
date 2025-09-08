var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/lib/auth.ts
import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
async function refreshAccessToken(refreshToken) {
  try {
    if (!refreshToken) {
      if (typeof window !== "undefined") {
        console.error("No refresh token available");
      }
      throw new Error("No refresh token available");
    }
    if (!process.env.COGNITO_ISSUER || !process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_CLIENT_SECRET) {
      if (typeof window !== "undefined") {
        console.error("Missing Cognito environment variables");
      }
      throw new Error("Missing Cognito configuration");
    }
    const url = `${process.env.COGNITO_ISSUER}/oauth2/token`;
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      console.log("Attempting to refresh token at:", url);
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.COGNITO_CLIENT_ID,
        client_secret: process.env.COGNITO_CLIENT_SECRET
      })
    });
    const responseText = await response.text();
    let refreshedTokens;
    try {
      refreshedTokens = JSON.parse(responseText);
    } catch (parseError) {
      if (typeof window !== "undefined") {
        console.error("Failed to parse refresh response:", responseText);
      }
      throw new Error(`Invalid response from token endpoint: ${responseText}`);
    }
    if (!response.ok) {
      if (typeof window !== "undefined") {
        console.error("Token refresh failed:", {
          status: response.status,
          statusText: response.statusText,
          error: refreshedTokens.error,
          error_description: refreshedTokens.error_description
        });
      }
      throw new Error(
        refreshedTokens.error_description || refreshedTokens.error || "Token refresh failed"
      );
    }
    if (!refreshedTokens.access_token) {
      if (typeof window !== "undefined") {
        console.error("No access token in refresh response:", refreshedTokens);
      }
      throw new Error("Invalid token refresh response - missing access_token");
    }
    return {
      access_token: refreshedTokens.access_token,
      id_token: refreshedTokens.id_token,
      expires_in: refreshedTokens.expires_in ?? 3600,
      // Default to 1 hour
      refresh_token: refreshedTokens.refresh_token
    };
  } catch (error) {
    if (typeof window !== "undefined") {
      console.error("Error refreshing access token:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : void 0
      });
    }
    throw error;
  }
}
__name(refreshAccessToken, "refreshAccessToken");
var authConfig = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      checks: ["pkce", "state"],
      // no "nonce"
      authorization: {
        params: {
          scope: "openid email profile",
          response_type: "code",
          response_mode: "query"
        }
      },
      // Override the nonce check
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        if (process.env.NODE_ENV === "development") {
          console.log("JWT Callback - Initial sign in", { account, profile });
        }
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          username: profile.preferred_username || profile.email,
          groups: profile["cognito:groups"] || []
        };
      }
      const refreshBuffer = 5 * 60 * 1e3;
      if (Date.now() < token.expiresAt * 1e3 - refreshBuffer) {
        return token;
      }
      if (process.env.NODE_ENV === "development") {
        console.log("Token expired or expiring soon, refreshing...");
      }
      if (!token.refreshToken) {
        if (typeof window !== "undefined") {
          console.error("No refresh token available in JWT token");
        }
        return { ...token, error: "RefreshAccessTokenError" };
      }
      try {
        const refreshedTokens = await refreshAccessToken(
          token.refreshToken
        );
        if (process.env.NODE_ENV === "development") {
          console.log("Token refreshed successfully");
        }
        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          idToken: refreshedTokens.id_token,
          refreshToken: refreshedTokens.refresh_token || token.refreshToken,
          // Use new refresh token if provided
          expiresAt: Math.floor(Date.now() / 1e3) + refreshedTokens.expires_in
        };
      } catch (error) {
        if (typeof window !== "undefined") {
          console.error("Failed to refresh access token:", {
            error: error instanceof Error ? error.message : error,
            hasRefreshToken: !!token.refreshToken,
            tokenExpiry: token.expiresAt ? new Date(token.expiresAt * 1e3).toISOString() : "unknown"
          });
        }
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Session Callback", { token });
      }
      if (token.error === "RefreshAccessTokenError") {
        if (typeof window !== "undefined") {
          console.error(
            "Session has a refresh error, user needs to re-authenticate"
          );
        }
        return {
          ...session,
          error: "RefreshAccessTokenError"
        };
      }
      session.user = {
        ...session.user,
        id: token.sub
      };
      session.username = token.username;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.expiresAt = token.expiresAt;
      session.groups = token.groups || [];
      const groups = token.groups || [];
      if (groups.includes("Admins") || groups.includes("Administrators")) {
        session.captifyStatus = "approved";
      } else {
        session.captifyStatus = "pending";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Redirect callback", { url, baseUrl });
      }
      return baseUrl;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60
    // 1 hour
  },
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900
        // 15 minutes
      }
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900
        // 15 minutes
      }
    },
    nonce: {
      name: "next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900
        // 15 minutes
      }
    }
  }
};
var authResult = NextAuth(authConfig);
var handlers = authResult.handlers;
var auth = authResult.auth;
var signIn = authResult.signIn;
var signOut = authResult.signOut;
export {
  auth,
  handlers,
  signIn,
  signOut
};
//# sourceMappingURL=auth.mjs.map