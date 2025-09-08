var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/lib/api.ts
var ApiClient = class {
  static {
    __name(this, "ApiClient");
  }
  currentAppIdentityPoolId = void 0;
  currentAppSlug = void 0;
  // Set the current app's identity pool ID (called when app context changes)
  setAppIdentityPool(poolId, appSlug) {
    if (this.currentAppIdentityPoolId !== poolId || this.currentAppSlug !== appSlug) {
      this.currentAppIdentityPoolId = poolId;
      this.currentAppSlug = appSlug;
      console.log(`[ApiClient] Identity pool set for app '${appSlug || "unknown"}':`, poolId || "none");
    }
  }
  // Get the current identity pool (for debugging)
  getCurrentIdentityPool() {
    return this.currentAppIdentityPoolId;
  }
  async run(request) {
    try {
      const app = request.app || "core";
      const url = `/api/captify`;
      const finalRequest = {
        ...request,
        identityPoolId: request.identityPoolId || this.currentAppIdentityPoolId
      };
      console.log("[ApiClient] Request details:", {
        service: request.service,
        operation: request.operation,
        providedPoolId: request.identityPoolId,
        currentAppPoolId: this.currentAppIdentityPoolId,
        finalPoolId: finalRequest.identityPoolId
      });
      if (!request.identityPoolId && this.currentAppIdentityPoolId) {
        console.log("[ApiClient] Using app identity pool for request:", this.currentAppIdentityPoolId);
      }
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app": app
        },
        body: JSON.stringify(finalRequest)
        // Use finalRequest which includes identityPoolId
      };
      if (request.useCache) {
        fetchOptions.cache = "force-cache";
      }
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
};
var apiClient = new ApiClient();
async function runCognitoAdminOperation(operation, params) {
  const adminPoolId = process.env.NEXT_PUBLIC_COGNITO_ADMIN_IDENTITY_POOL_ID || "us-east-1:52e865f2-4871-4a74-8976-edc945af0c0f";
  return apiClient.run({
    service: "cognito",
    operation,
    app: "core",
    identityPoolId: adminPoolId,
    forceRefresh: true,
    // Always refresh for admin operations
    data: params
  });
}
__name(runCognitoAdminOperation, "runCognitoAdminOperation");

// src/lib/react-compat.ts
import React from "react";
if (typeof window !== "undefined" && !window.React) {
  window.React = React;
}
function useSafeRef(initialValue) {
  if (typeof window === "undefined") {
    return { current: initialValue };
  }
  return React.useRef(initialValue);
}
__name(useSafeRef, "useSafeRef");
function useSafeState(initialState) {
  if (typeof window === "undefined") {
    const initial = typeof initialState === "function" ? initialState() : initialState;
    return [initial, () => {
    }];
  }
  return React.useState(initialState);
}
__name(useSafeState, "useSafeState");
function useSafeEffect(effect, deps) {
  if (typeof window === "undefined") {
    return;
  }
  return React.useEffect(effect, deps);
}
__name(useSafeEffect, "useSafeEffect");
var useState = useSafeState;
var useRef = useSafeRef;
var useEffect = useSafeEffect;

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

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
__name(cn, "cn");
var ApiClient2 = class {
  static {
    __name(this, "ApiClient");
  }
  async run(request) {
    try {
      const app = request.app || "core";
      const url = `/api/captify`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app": app
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
};
var apiClient2 = new ApiClient2();
export {
  apiClient,
  auth,
  cn,
  handlers,
  runCognitoAdminOperation,
  signIn,
  signOut,
  useEffect,
  useRef,
  useSafeEffect,
  useSafeRef,
  useSafeState,
  useState
};
//# sourceMappingURL=api.mjs.map