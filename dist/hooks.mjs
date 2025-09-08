"use client";
"use client";
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/hooks/use-mobile.ts
import * as React from "react";
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    void 0
  );
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = /* @__PURE__ */ __name(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, "onChange");
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
__name(useIsMobile, "useIsMobile");

// src/hooks/useApplicationAccess.ts
import { useState as useState2, useEffect as useEffect2, useCallback } from "react";
import { useSession } from "next-auth/react";

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

// src/hooks/useApplicationAccess.ts
function useApplicationAccess() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState2(false);
  const [error, setError] = useState2(null);
  const [myApps, setMyApps] = useState2([]);
  const [allApps, setAllApps] = useState2([]);
  const [pendingRequests, setPendingRequests] = useState2([]);
  const fetchAllApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.run({
        app: "core",
        service: "applicationAccess",
        operation: "getInstalledApps"
      });
      if (response.success) {
        setAllApps(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchMyApps = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.run({
        app: "core",
        service: "applicationAccess",
        operation: "getUserApps"
      });
      if (response.success) {
        setMyApps(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch your applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [session]);
  const requestAccess = useCallback(
    async (appId, justification, requestedRole, autoExpireDays) => {
      if (!session?.user?.id || !session?.user?.email) {
        setError("You must be logged in to request access");
        return false;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "requestAccess",
          data: {
            appId,
            justification,
            requestedRole,
            autoExpireDays
          }
        });
        if (response.success) {
          await fetchPendingRequests();
          return true;
        } else {
          throw new Error(response.error || "Failed to request access");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );
  const fetchPendingRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      setPendingRequests([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [session]);
  const getAccessProfile = useCallback(
    async (appId) => {
      if (!session?.user?.id) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "getUserAccessProfile",
          data: { appId }
        });
        if (response.success) {
          return response.data || null;
        } else if (response.error?.includes("No access")) {
          return null;
        } else {
          throw new Error(response.error || "Failed to fetch access profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );
  const hasAccess = useCallback(
    (appId) => {
      return myApps.some((app) => app.id === appId);
    },
    [myApps]
  );
  const hasPendingRequest = useCallback(
    (appId) => {
      return pendingRequests.some(
        (req) => req.appId === appId && req.status === "pending"
      );
    },
    [pendingRequests]
  );
  useEffect2(() => {
    if (session?.user?.id) {
      fetchAllApps();
      fetchMyApps();
      fetchPendingRequests();
    }
  }, [session, fetchAllApps, fetchMyApps, fetchPendingRequests]);
  return {
    // State
    loading,
    error,
    myApps,
    allApps,
    pendingRequests,
    // Actions
    requestAccess,
    getAccessProfile,
    // Helpers
    hasAccess,
    hasPendingRequest,
    // Refresh methods
    refresh: {
      allApps: fetchAllApps,
      myApps: fetchMyApps,
      pendingRequests: fetchPendingRequests
    }
  };
}
__name(useApplicationAccess, "useApplicationAccess");
function useApplicationAdmin() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState2(false);
  const [error, setError] = useState2(null);
  const [pendingRequests, setPendingRequests] = useState2([]);
  const fetchPendingRequests = useCallback(async (appId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.run({
        app: "core",
        service: "applicationAccess",
        operation: "getPendingRequests",
        data: appId ? { appId } : void 0
      });
      if (response.success) {
        setPendingRequests(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch pending requests");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);
  const approveRequest = useCallback(
    async (requestId, roleId, reviewNotes) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "approveRequest",
          data: {
            requestId,
            roleId,
            reviewNotes
          }
        });
        if (response.success) {
          await fetchPendingRequests();
          return true;
        } else {
          throw new Error(response.error || "Failed to approve request");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPendingRequests]
  );
  const rejectRequest = useCallback(
    async (requestId, reviewNotes) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "rejectRequest",
          data: {
            requestId,
            reviewNotes
          }
        });
        if (response.success) {
          await fetchPendingRequests();
          return true;
        } else {
          throw new Error(response.error || "Failed to reject request");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPendingRequests]
  );
  const grantAccess = useCallback(
    async (userId, appId, roleId, justification, expireDays) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "grantAccess",
          data: {
            userId,
            appId,
            roleId,
            justification,
            expireDays
          }
        });
        if (response.success) {
          return true;
        } else {
          throw new Error(response.error || "Failed to grant access");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const revokeAccess = useCallback(
    async (userId, appId, reason) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "revokeAccess",
          data: {
            userId,
            appId,
            reason
          }
        });
        if (response.success) {
          return true;
        } else {
          throw new Error(response.error || "Failed to revoke access");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const getAppSummary = useCallback(
    async (appId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.run({
          app: "core",
          service: "applicationAccess",
          operation: "getAppAccessSummary",
          data: { appId }
        });
        if (response.success) {
          return response.data || null;
        } else {
          throw new Error(response.error || "Failed to fetch app summary");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  useEffect2(() => {
    if (session?.user?.id) {
      fetchPendingRequests();
    }
  }, [session, fetchPendingRequests]);
  return {
    // State
    loading,
    error,
    pendingRequests,
    // Actions
    approveRequest,
    rejectRequest,
    grantAccess,
    revokeAccess,
    getAppSummary,
    // Refresh methods
    refresh: {
      pendingRequests: fetchPendingRequests
    }
  };
}
__name(useApplicationAdmin, "useApplicationAdmin");

// src/hooks/useFavorites.ts
import { useCallback as useCallback2, useEffect as useEffect3 } from "react";

// src/lib/react-compat.ts
import React2 from "react";
if (typeof window !== "undefined" && !window.React) {
  window.React = React2;
}
function useSafeState(initialState) {
  if (typeof window === "undefined") {
    const initial = typeof initialState === "function" ? initialState() : initialState;
    return [initial, () => {
    }];
  }
  return React2.useState(initialState);
}
__name(useSafeState, "useSafeState");
var useState3 = useSafeState;

// src/components/providers/CaptifyProvider.tsx
import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
var CaptifyContext = createContext({
  session: null,
  isLoading: true
});
function useCaptify() {
  const context = useContext(CaptifyContext);
  if (!context) {
    throw new Error("useCaptify must be used within a CaptifyProvider");
  }
  return context;
}
__name(useCaptify, "useCaptify");

// src/hooks/useFavorites.ts
function useFavorites() {
  const { session } = useCaptify();
  const [favoriteApps, setFavoriteApps] = useState3([]);
  const [loading, setLoading] = useState3(false);
  const fetchFavoriteApps = useCallback2(async () => {
    if (!session?.user || !session.user?.id) {
      setFavoriteApps([]);
      return;
    }
    setLoading(true);
    try {
      const userId = session.user.id;
      const response = await apiClient.run({
        service: "dynamo",
        operation: "query",
        app: "core",
        table: "UserState",
        data: {
          IndexName: "userId-index",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId
          },
          Limit: 1
        }
      });
      if (response.success && response.data?.Items?.length > 0) {
        const userState = response.data.Items[0];
        setFavoriteApps(userState.favoriteApps || []);
      } else {
        setFavoriteApps([]);
      }
    } catch (error) {
      console.error("Error fetching favorite apps:", error);
      setFavoriteApps([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);
  const toggleFavorite = useCallback2(
    async (appId) => {
      if (!session?.user || !session.user?.id) return;
      const newFavorites = favoriteApps.includes(appId) ? favoriteApps.filter((id) => id !== appId) : [...favoriteApps, appId];
      setFavoriteApps(newFavorites);
      try {
        const userId = session.user.id;
        const userStatesResponse = await apiClient.run({
          service: "dynamo",
          operation: "query",
          app: "core",
          table: "UserState",
          data: {
            IndexName: "userId-index",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
              ":userId": userId
            },
            Limit: 1
          }
        });
        if (userStatesResponse.success && userStatesResponse.data?.Items?.length > 0) {
          const userState = userStatesResponse.data.Items[0];
          await apiClient.run({
            service: "dynamo",
            operation: "update",
            app: "core",
            table: "UserState",
            data: {
              key: { id: userState.id },
              updateExpression: "SET favoriteApps = :favorites, updatedAt = :updatedAt",
              expressionAttributeValues: {
                ":favorites": newFavorites,
                ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
              }
            }
          });
        } else {
          const newUserState = {
            id: `userstate-${userId}-${Date.now()}`,
            slug: `userstate-${userId}`,
            name: `UserState for ${session.user.email || userId}`,
            app: "core",
            order: "0",
            fields: {},
            description: "User preferences and state",
            ownerId: userId,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdBy: userId,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedBy: userId,
            userId,
            favoriteApps: newFavorites,
            recentApps: [],
            preferences: {}
          };
          await apiClient.run({
            service: "dynamo",
            operation: "put",
            app: "core",
            table: "UserState",
            data: {
              item: newUserState
            }
          });
        }
      } catch (error) {
        console.error("Error updating favorite apps:", error);
        setFavoriteApps(favoriteApps);
      }
    },
    [session?.user, favoriteApps]
  );
  useEffect3(() => {
    fetchFavoriteApps();
  }, [fetchFavoriteApps]);
  const isFavorite = useCallback2(
    (appId) => {
      return favoriteApps.includes(appId);
    },
    [favoriteApps]
  );
  return {
    favoriteApps,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavoriteApps
  };
}
__name(useFavorites, "useFavorites");

// src/hooks/useApi.ts
import { useState as useState4, useCallback as useCallback3 } from "react";

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

// src/hooks/useApi.ts
function useApi(apiCall) {
  const [state, setState] = useState4({
    data: null,
    loading: false,
    error: null
  });
  const execute = useCallback3(
    async (...args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiCall(apiClient, ...args);
        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null
          });
          return response.data || null;
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || "API call failed"
          });
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setState({
          data: null,
          loading: false,
          error: errorMessage
        });
        return null;
      }
    },
    [apiCall]
  );
  const reset = useCallback3(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);
  return {
    ...state,
    execute,
    reset
  };
}
__name(useApi, "useApi");
function useGetItem(tableName) {
  return useApi(
    (client, key) => client.run({
      service: "dynamo",
      operation: "getItem",
      app: "core",
      table: tableName,
      data: { Key: key }
    })
  );
}
__name(useGetItem, "useGetItem");
function usePutItem(tableName) {
  return useApi(
    (client, item) => client.run({
      service: "dynamo",
      operation: "put",
      app: "core",
      table: tableName,
      data: { Item: item }
    })
  );
}
__name(usePutItem, "usePutItem");
function useUpdateItem(tableName) {
  return useApi(
    (client, key, updateExpression, expressionAttributeValues, expressionAttributeNames) => client.run({
      service: "dynamo",
      operation: "update",
      app: "core",
      table: tableName,
      data: {
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW"
      }
    })
  );
}
__name(useUpdateItem, "useUpdateItem");
function useDeleteItem(tableName) {
  return useApi(
    (client, key) => client.run({
      service: "dynamo",
      operation: "delete",
      app: "core",
      table: tableName,
      data: { Key: key }
    })
  );
}
__name(useDeleteItem, "useDeleteItem");
function useScanTable(tableName) {
  return useApi(
    (client, params = {}) => client.run({
      service: "dynamo",
      operation: "scan",
      app: "core",
      table: tableName,
      data: params
    })
  );
}
__name(useScanTable, "useScanTable");
function useAuth() {
  return {
    // validateSession: validateSession.execute,
    // refreshSession: refreshSession.execute,
    // getAwsCredentials: getAwsCredentials.execute,
    loading: false,
    error: null
  };
}
__name(useAuth, "useAuth");

// src/hooks/useAppContext.ts
import { useState as useState5, useEffect as useEffect4, useCallback as useCallback4 } from "react";
import { useSession as useSession2 } from "next-auth/react";
function useAppContext() {
  const { data: session } = useSession2();
  const [availableApps, setAvailableApps] = useState5([]);
  const [appsLoading, setAppsLoading] = useState5(false);
  const [currentApp, setCurrentAppState] = useState5(void 0);
  const fetchAvailableApps = useCallback4(async () => {
    if (!session?.user) return;
    setAppsLoading(true);
    try {
      const response = await apiClient.run({
        service: "dynamo",
        operation: "scan",
        app: "core",
        table: "App",
        data: {
          FilterExpression: "#status = :status",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":status": "active"
          }
        }
      });
      if (response.success && response.data?.Items) {
        setAvailableApps(response.data.Items);
      }
    } catch (error) {
      console.error("Error fetching available apps:", error);
    } finally {
      setAppsLoading(false);
    }
  }, [session?.user]);
  useEffect4(() => {
    if (session?.user) {
      fetchAvailableApps();
    }
  }, [session?.user, fetchAvailableApps]);
  const setCurrentApp = useCallback4((app) => {
    setCurrentAppState(app);
  }, []);
  const getCurrentAppConfig = useCallback4(() => {
    return currentApp;
  }, [currentApp]);
  const getCurrentIdentityPoolId = useCallback4(() => {
    if (currentApp?.identityPoolId) {
      return currentApp.identityPoolId;
    }
    const coreApp = availableApps.find((app) => app.slug === "core");
    return coreApp?.identityPoolId;
  }, [currentApp, availableApps]);
  const getAppBySlug = useCallback4(
    (slug) => {
      return availableApps.find((app) => app.slug === slug);
    },
    [availableApps]
  );
  const isAppAvailable = useCallback4(
    (slug) => {
      return availableApps.some(
        (app) => app.slug === slug && app.status === "active"
      );
    },
    [availableApps]
  );
  const getAppAwsConfig = useCallback4(
    (slug) => {
      const app = getAppBySlug(slug);
      return {
        identityPoolId: app?.identityPoolId,
        agentId: app?.agentId,
        agentAliasId: app?.agentAliasId
      };
    },
    [getAppBySlug]
  );
  return {
    // App context data
    currentApp,
    availableApps,
    appsLoading,
    // App management functions
    setCurrentApp,
    getCurrentAppConfig,
    getAppBySlug,
    isAppAvailable,
    // AWS configuration helpers
    getCurrentIdentityPoolId,
    getAppAwsConfig
  };
}
__name(useAppContext, "useAppContext");

// src/hooks/useSafeRef.ts
import { useRef } from "react";
function useSafeRef(initialValue) {
  try {
    return useRef(initialValue);
  } catch (error) {
    console.warn("useSafeRef failed, returning fallback:", error);
    return {
      current: initialValue
    };
  }
}
__name(useSafeRef, "useSafeRef");
function useDOMRef() {
  try {
    return useRef(null);
  } catch (error) {
    console.warn("useDOMRef failed, returning fallback:", error);
    return {
      current: null
    };
  }
}
__name(useDOMRef, "useDOMRef");
function safeRefAccess(ref, callback, fallback) {
  try {
    if (typeof window !== "undefined" && ref?.current) {
      callback(ref.current);
    } else if (fallback) {
      fallback();
    }
  } catch (error) {
    console.warn("safeRefAccess failed:", error);
    if (fallback) {
      fallback();
    }
  }
}
__name(safeRefAccess, "safeRefAccess");
export {
  safeRefAccess,
  useApi,
  useAppContext,
  useApplicationAccess,
  useApplicationAdmin,
  useAuth,
  useCaptify,
  useDOMRef,
  useDeleteItem,
  useFavorites,
  useGetItem,
  useIsMobile,
  usePutItem,
  useSafeRef,
  useScanTable,
  useUpdateItem
};
//# sourceMappingURL=hooks.mjs.map