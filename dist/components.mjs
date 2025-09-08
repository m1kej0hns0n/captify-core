"use client";
"use client";
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/components/navigation/FavoritesBar.tsx
import { useMemo, useEffect as useEffect2, useCallback as useCallback2 } from "react";

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
var useState = useSafeState;

// src/components/navigation/FavoritesBar.tsx
import { useRouter } from "next/navigation";

// src/components/ui/button.tsx
import * as React2 from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

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

// src/components/ui/button.tsx
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React2.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/components/navigation/FavoritesBar.tsx
import { DynamicIcon } from "lucide-react/dynamic";
import { Star, ChevronRight } from "lucide-react";

// src/components/providers/CaptifyProvider.tsx
import { createContext, useContext } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var CaptifyContext = createContext({
  session: null,
  isLoading: true
});
function CaptifyProvider({
  children,
  session = null
}) {
  const contextValue = {
    session,
    isLoading: false
  };
  return /* @__PURE__ */ jsx2(CaptifyContext.Provider, { value: contextValue, children });
}
__name(CaptifyProvider, "CaptifyProvider");
function useCaptify() {
  const context = useContext(CaptifyContext);
  if (!context) {
    throw new Error("useCaptify must be used within a CaptifyProvider");
  }
  return context;
}
__name(useCaptify, "useCaptify");

// src/hooks/useFavorites.ts
import { useCallback, useEffect } from "react";
function useFavorites() {
  const { session } = useCaptify();
  const [favoriteApps, setFavoriteApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchFavoriteApps = useCallback(async () => {
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
  const toggleFavorite = useCallback(
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
  useEffect(() => {
    fetchFavoriteApps();
  }, [fetchFavoriteApps]);
  const isFavorite = useCallback(
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

// src/components/navigation/FavoritesBar.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function FavoritesBar() {
  const router = useRouter();
  const { session } = useCaptify();
  const { favoriteApps, loading: favoritesLoading } = useFavorites();
  const [availableApps, setAvailableApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const fetchAvailableApps = useCallback2(async () => {
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
  useEffect2(() => {
    if (session?.user) {
      fetchAvailableApps();
    }
  }, [session?.user, fetchAvailableApps]);
  const favoriteAppObjects = useMemo(() => {
    if (appsLoading || availableApps.length === 0) return [];
    return favoriteApps.map(
      (appId) => availableApps.find((app) => app.id === appId)
    ).filter((app) => app !== void 0).slice(0, 8);
  }, [favoriteApps, availableApps, appsLoading]);
  if (appsLoading || favoritesLoading || favoriteAppObjects.length === 0) {
    return null;
  }
  const handleAppClick = /* @__PURE__ */ __name((app) => {
    router.push(`/${app.slug}`);
  }, "handleAppClick");
  return /* @__PURE__ */ jsx3("div", { className: "border-b border-border bg-background", children: /* @__PURE__ */ jsx3("div", { className: "flex items-center px-2 py-1 gap-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-1 gap-1 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx3(Star, { className: "h-3 w-3 text-yellow-500 fill-yellow-500" }),
      /* @__PURE__ */ jsx3("span", { className: "text-xs font-medium text-muted-foreground", children: "Favorites" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 overflow-x-auto", children: [
      favoriteAppObjects.map((app) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "flex items-center space-x-1 px-2 py-0.5 h-7 text-xs hover:bg-accent/50 transition-colors",
          onClick: () => handleAppClick(app),
          children: [
            /* @__PURE__ */ jsx3(
              DynamicIcon,
              {
                name: app.icon || "package",
                className: "h-3 w-3 text-muted-foreground"
              }
            ),
            /* @__PURE__ */ jsx3("span", { className: "text-foreground", children: app.name })
          ]
        },
        app.id
      )),
      favoriteApps.length > 8 && /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "flex items-center space-x-1 px-2 py-0.5 h-7 text-xs text-muted-foreground hover:bg-accent/50",
          onClick: () => {
            console.log("Show more favorites");
          },
          children: [
            /* @__PURE__ */ jsx3(ChevronRight, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "+",
              favoriteApps.length - 8
            ] })
          ]
        }
      )
    ] })
  ] }) }) });
}
__name(FavoritesBar, "FavoritesBar");

// src/components/navigation/SignInForm.tsx
import { useEffect as useEffect3, useCallback as useCallback3 } from "react";
import { signIn as signIn2 } from "next-auth/react";
import { Fragment, jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var APPROVED_DOMAINS = [".com", ".mil", ".gov", ".ai", ".net", ".org", ".us"];
function SignInForm({
  callbackUrl = "/",
  error
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [emailSaved, setEmailSaved] = useState(false);
  const hasApprovedDomain = useCallback3((email2) => {
    return APPROVED_DOMAINS.some(
      (domain) => email2.toLowerCase().endsWith(domain)
    );
  }, []);
  const isEmailValid = useCallback3(
    (email2) => {
      return EMAIL_REGEX.test(email2) && hasApprovedDomain(email2);
    },
    [hasApprovedDomain]
  );
  useEffect3(() => {
    if (typeof window !== "undefined") {
      const savedEmail = getCookie("cognito_login_hint");
      if (savedEmail) {
        const decodedEmail = decodeURIComponent(savedEmail);
        setEmail(decodedEmail);
        const isValid = isEmailValid(decodedEmail);
        setEmailValid(isValid);
        setEmailSaved(isValid);
      }
    }
  }, [isEmailValid]);
  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }
  __name(getCookie, "getCookie");
  function setCookie(name, value, maxAge = 300) {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=${encodeURIComponent(
        value
      )}; path=/; max-age=${maxAge}; secure; samesite=strict`;
    }
  }
  __name(setCookie, "setCookie");
  function deleteCookie(name) {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
  __name(deleteCookie, "deleteCookie");
  const handleEmailChange = /* @__PURE__ */ __name((e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail.trim() === "") {
      setEmailValid(null);
      setEmailSaved(false);
      deleteCookie("cognito_login_hint");
    } else {
      const isValid = isEmailValid(newEmail);
      setEmailValid(isValid);
      if (isValid) {
        setCookie("cognito_login_hint", newEmail);
        setEmailSaved(true);
      } else {
        setEmailSaved(false);
        deleteCookie("cognito_login_hint");
      }
    }
  }, "handleEmailChange");
  const handleClearEmail = /* @__PURE__ */ __name(() => {
    setEmail("");
    setEmailValid(null);
    setEmailSaved(false);
    deleteCookie("cognito_login_hint");
  }, "handleClearEmail");
  const handleContactUs = /* @__PURE__ */ __name(() => {
    alert("Redirecting to helpdesk module...");
  }, "handleContactUs");
  const handleSubmit = /* @__PURE__ */ __name(async (e) => {
    e.preventDefault();
    if (!emailSaved) {
      alert("Please validate your email address first");
      return;
    }
    setIsLoading(true);
    try {
      await signIn2("cognito", {
        callbackUrl,
        redirect: true
      });
    } catch (error2) {
      console.error("Signin error:", error2);
      setIsLoading(false);
    }
  }, "handleSubmit");
  return /* @__PURE__ */ jsxs2("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx4("div", { className: "absolute inset-0 opacity-5", children: /* @__PURE__ */ jsx4(
      "div",
      {
        className: "w-full h-full",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }
      }
    ) }),
    /* @__PURE__ */ jsx4("div", { className: "relative w-full max-w-md", children: /* @__PURE__ */ jsxs2("div", { className: "bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10", children: [
      /* @__PURE__ */ jsx4("div", { className: "text-center mb-6", children: /* @__PURE__ */ jsx4(
        "h1",
        {
          className: "text-3xl sm:text-4xl font-black text-white tracking-wide mb-2",
          style: {
            fontFamily: "Inter, system-ui, -apple-system, sans-serif"
          },
          children: "Captify.io"
        }
      ) }),
      error && /* @__PURE__ */ jsx4("div", { className: "mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl backdrop-blur-sm", children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx4(
          "svg",
          {
            className: "w-5 h-5 text-red-400 mr-3 flex-shrink-0",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx4(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs2("p", { className: "text-sm text-red-200", children: [
          error === "AccessDenied" && "Access denied. Please contact your administrator.",
          error === "Configuration" && "There is a problem with the server configuration.",
          error === "Verification" && "The verification token has expired or is invalid.",
          error && !["AccessDenied", "Configuration", "Verification"].includes(
            error
          ) && "An error occurred during authentication."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs2("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsx4("div", { className: "mb-4 p-4 bg-slate-900/80 border border-slate-600/30 rounded-lg shadow-inner", children: /* @__PURE__ */ jsxs2("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsx4(
            "svg",
            {
              className: "h-4 w-4 text-amber-500/70 mt-0.5 mr-3 flex-shrink-0",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx4(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs2("div", { children: [
            /* @__PURE__ */ jsx4("h3", { className: "text-xs font-semibold text-amber-300/80 mb-1", children: "Authorized Use Only" }),
            /* @__PURE__ */ jsx4("p", { className: "text-xs text-slate-400/90 leading-relaxed", children: "U.S. Government system for authorized users only. No expectation of privacy. By accessing this system, you consent to monitoring and agree to these terms." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsxs2("div", { className: "relative", children: [
            /* @__PURE__ */ jsx4(
              "input",
              {
                id: "email",
                type: "email",
                value: email,
                onChange: handleEmailChange,
                placeholder: "Enter your work email address",
                className: "w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm",
                required: true,
                disabled: isLoading
              }
            ),
            /* @__PURE__ */ jsx4("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1", children: email && /* @__PURE__ */ jsx4(Fragment, { children: emailSaved ? /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                onClick: handleClearEmail,
                className: "p-1.5 hover:bg-slate-600 rounded-lg transition-colors",
                title: "Clear email",
                children: /* @__PURE__ */ jsx4(
                  "svg",
                  {
                    className: "h-4 w-4 text-red-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx4(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                      }
                    )
                  }
                )
              }
            ) : emailValid ? /* @__PURE__ */ jsx4(
              "svg",
              {
                className: "h-5 w-5 text-green-400",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx4(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M5 13l4 4L19 7"
                  }
                )
              }
            ) : emailValid === false ? /* @__PURE__ */ jsx4(
              "svg",
              {
                className: "h-5 w-5 text-red-400",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx4(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M6 18L18 6M6 6l12 12"
                  }
                )
              }
            ) : null }) })
          ] }),
          emailSaved && /* @__PURE__ */ jsxs2("div", { className: "flex items-center mt-3 text-green-400", children: [
            /* @__PURE__ */ jsx4(
              "svg",
              {
                className: "w-4 h-4 mr-2",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx4(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M5 13l4 4L19 7"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx4("p", { className: "text-xs", children: "Email validated and saved" })
          ] }),
          emailValid === false && email && /* @__PURE__ */ jsxs2("div", { className: "flex items-center mt-3 text-red-400", children: [
            /* @__PURE__ */ jsx4(
              "svg",
              {
                className: "w-4 h-4 mr-2",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx4(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx4("p", { className: "text-xs", children: "Please enter a valid email with an approved domain" })
          ] })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx4(
          "button",
          {
            type: "submit",
            disabled: !emailSaved || isLoading,
            className: `py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${emailSaved && !isLoading ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 focus:ring-green-500" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500"}`,
            children: isLoading ? /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsx4("div", { className: "animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" }),
              "Connecting to Secure Portal..."
            ] }) : /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsx4(
                "svg",
                {
                  className: "w-5 h-5 mr-2",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx4(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    }
                  )
                }
              ),
              "Secure Authentication"
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx4("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxs2("p", { className: "text-xs text-slate-400", children: [
        "Need assistance?",
        " ",
        /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: handleContactUs,
            className: "text-blue-400 hover:text-blue-300 underline transition-colors",
            children: "Contact Us"
          }
        )
      ] }) })
    ] }) })
  ] });
}
__name(SignInForm, "SignInForm");

// src/components/navigation/SmartBreadcrumb.tsx
import React5, { useMemo as useMemo2 } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// src/components/ui/breadcrumb.tsx
import * as React4 from "react";
import { Slot as Slot2 } from "@radix-ui/react-slot";
import { ChevronRight as ChevronRight2, MoreHorizontal } from "lucide-react";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var Breadcrumb = React4.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx5("nav", { ref, "aria-label": "breadcrumb", ...props }));
Breadcrumb.displayName = "Breadcrumb";
var BreadcrumbList = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
  "ol",
  {
    ref,
    className: cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    ),
    ...props
  }
));
BreadcrumbList.displayName = "BreadcrumbList";
var BreadcrumbItem = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
  "li",
  {
    ref,
    className: cn("inline-flex items-center gap-1.5", className),
    ...props
  }
));
BreadcrumbItem.displayName = "BreadcrumbItem";
var BreadcrumbLink = React4.forwardRef(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot2 : "a";
  return /* @__PURE__ */ jsx5(
    Comp,
    {
      ref,
      className: cn("transition-colors hover:text-foreground", className),
      ...props
    }
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";
var BreadcrumbPage = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
  "span",
  {
    ref,
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
    className: cn("font-normal text-foreground", className),
    ...props
  }
));
BreadcrumbPage.displayName = "BreadcrumbPage";
var BreadcrumbSeparator = /* @__PURE__ */ __name(({
  children,
  className,
  ...props
}) => /* @__PURE__ */ jsx5(
  "li",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className),
    ...props,
    children: children ?? /* @__PURE__ */ jsx5(ChevronRight2, {})
  }
), "BreadcrumbSeparator");
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
var BreadcrumbEllipsis = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs3(
  "span",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: cn("flex h-9 w-9 items-center justify-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx5(MoreHorizontal, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx5("span", { className: "sr-only", children: "More" })
    ]
  }
), "BreadcrumbEllipsis");
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

// src/components/navigation/SmartBreadcrumb.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function SmartBreadcrumb({
  className,
  maxItems = 5,
  showMenuToggle = true
}) {
  const { session } = useCaptify();
  const pathname = usePathname();
  const isAuthenticated = !!session;
  const breadcrumbs = useMemo2(() => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    const items = [{ label: "Home", href: "/" }];
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      items.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? void 0 : currentPath,
        isActive: isLast
      });
    });
    return items;
  }, [pathname]);
  if (breadcrumbs.length <= 1) {
    return null;
  }
  const displayedBreadcrumbs = breadcrumbs.length > maxItems ? [
    breadcrumbs[0],
    // Always show root
    { label: "...", href: void 0 },
    // Ellipsis
    ...breadcrumbs.slice(-2)
    // Show last 2 items
  ] : breadcrumbs;
  return /* @__PURE__ */ jsx6(
    "div",
    {
      className: cn(
        "flex items-center px-4 py-2 border-b border-border",
        className
      ),
      children: /* @__PURE__ */ jsx6(Breadcrumb, { children: /* @__PURE__ */ jsx6(BreadcrumbList, { children: displayedBreadcrumbs.map((item, index) => /* @__PURE__ */ jsxs4(React5.Fragment, { children: [
        /* @__PURE__ */ jsx6(BreadcrumbItem, { children: item.href && !item.isActive ? /* @__PURE__ */ jsx6(
          Link,
          {
            href: item.href,
            className: "text-muted-foreground hover:text-foreground transition-colors",
            children: item.label
          }
        ) : /* @__PURE__ */ jsx6(
          BreadcrumbPage,
          {
            className: item.isActive ? "text-foreground font-medium" : "text-muted-foreground",
            children: item.label
          }
        ) }),
        index < displayedBreadcrumbs.length - 1 && /* @__PURE__ */ jsx6(BreadcrumbSeparator, {})
      ] }, index)) }) })
    }
  );
}
__name(SmartBreadcrumb, "SmartBreadcrumb");

// src/components/navigation/TopNavigation.tsx
import { useRouter as useRouter2 } from "next/navigation";
import { useEffect as useEffect6, useState as useState3 } from "react";
import { signOut as signOut2 } from "next-auth/react";

// src/components/ui/avatar.tsx
import * as React6 from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { jsx as jsx7 } from "react/jsx-runtime";
var Avatar = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
var AvatarImage = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
var AvatarFallback = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// src/components/ui/dropdown-menu.tsx
import * as React7 from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight as ChevronRight3, Circle } from "lucide-react";
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuPortal = DropdownMenuPrimitive.Portal;
var DropdownMenuSub = DropdownMenuPrimitive.Sub;
var DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
var DropdownMenuSubTrigger = React7.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs5(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx8(ChevronRight3, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx8(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
var DropdownMenuContent = React7.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx8(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx8(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
var DropdownMenuItem = React7.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx8(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
var DropdownMenuCheckboxItem = React7.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs5(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx8("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx8(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx8(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuRadioItem = React7.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs5(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx8("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx8(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx8(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
var DropdownMenuLabel = React7.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx8(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
var DropdownMenuSeparator = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx8(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
var DropdownMenuShortcut = /* @__PURE__ */ __name(({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx8(
    "span",
    {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props
    }
  );
}, "DropdownMenuShortcut");
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/components/search/GlobalSearch.tsx
import { Search } from "lucide-react";

// src/components/ui/input.tsx
import * as React8 from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var Input = React8.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx9(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

// src/components/search/GlobalSearch.tsx
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
function GlobalSearch({ className, onFocus }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  return /* @__PURE__ */ jsx10("div", { className: `relative ${className}`, children: /* @__PURE__ */ jsxs6("div", { className: "relative", children: [
    /* @__PURE__ */ jsx10(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
    /* @__PURE__ */ jsx10(
      Input,
      {
        placeholder: "Search...",
        value: query,
        onChange: (e) => setQuery(e.target.value),
        onFocus,
        className: "pl-9 bg-muted/50"
      }
    )
  ] }) });
}
__name(GlobalSearch, "GlobalSearch");

// src/components/theme/ThemeToggle.tsx
import { useTheme } from "next-themes";
import { useEffect as useEffect4 } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { jsx as jsx11 } from "react/jsx-runtime";
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  useEffect4(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return /* @__PURE__ */ jsx11(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "text-white hover:bg-gray-800 hover:text-white p-1 cursor-pointer",
        children: /* @__PURE__ */ jsx11(Sun, { className: "h-4 w-4" })
      }
    );
  }
  const toggleTheme = /* @__PURE__ */ __name(() => {
    const currentTheme = theme || "system";
    if (currentTheme === "system") {
      setTheme("light");
    } else if (currentTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  }, "toggleTheme");
  const getIcon = /* @__PURE__ */ __name(() => {
    const currentTheme = theme || "system";
    switch (currentTheme) {
      case "light":
        return /* @__PURE__ */ jsx11(Sun, { className: "h-4 w-4" });
      case "dark":
        return /* @__PURE__ */ jsx11(Moon, { className: "h-4 w-4" });
      case "system":
        return /* @__PURE__ */ jsx11(Monitor, { className: "h-4 w-4" });
      default:
        if (resolvedTheme === "dark") {
          return /* @__PURE__ */ jsx11(Monitor, { className: "h-4 w-4" });
        }
        return /* @__PURE__ */ jsx11(Monitor, { className: "h-4 w-4" });
    }
  }, "getIcon");
  return /* @__PURE__ */ jsx11(
    Button,
    {
      variant: "ghost",
      size: "sm",
      onClick: toggleTheme,
      className: "text-white hover:bg-gray-800 hover:text-white p-1 cursor-pointer",
      title: `Current theme: ${theme || "system"}. Click to cycle through system \u2192 light \u2192 dark.`,
      children: getIcon()
    }
  );
}
__name(ThemeToggle, "ThemeToggle");

// src/components/navigation/ApplicationLauncher.tsx
import { useState as useState2, useEffect as useEffect5 } from "react";

// src/components/ui/popover.tsx
import * as React9 from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx12 } from "react/jsx-runtime";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverContent = React9.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx12(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx12(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// src/components/ui/separator.tsx
import * as React10 from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx13 } from "react/jsx-runtime";
var Separator2 = React10.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx13(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator2.displayName = SeparatorPrimitive.Root.displayName;

// src/components/ui/scroll-area.tsx
import * as React11 from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
var ScrollArea = React11.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs7(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx14(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx14(ScrollBar, {}),
      /* @__PURE__ */ jsx14(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
var ScrollBar = React11.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx14(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx14(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// src/components/ui/skeleton.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx15(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-primary/10", className),
      ...props
    }
  );
}
__name(Skeleton, "Skeleton");

// src/components/navigation/ApplicationLauncher.tsx
import {
  Grid3X3,
  Star as Star2,
  Users,
  Shield,
  Activity,
  Settings,
  FileText,
  BarChart,
  Package,
  Layers,
  Search as Search2,
  Home,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { jsx as jsx16, jsxs as jsxs8 } from "react/jsx-runtime";
var categories = [
  "Operations",
  "Analytics",
  "Security",
  "Compliance",
  "Engineering",
  "Administration"
];
var iconMap = {
  Activity,
  FileText,
  Shield,
  BarChart,
  Package,
  Settings,
  Layers,
  Grid3X3,
  Star: Star2,
  Users,
  Home,
  Search: Search2
};
var getIconComponent = /* @__PURE__ */ __name((iconName) => {
  if (!iconName) return Grid3X3;
  return iconMap[iconName] || Grid3X3;
}, "getIconComponent");
function ApplicationLauncher({ currentApplication }) {
  const [isOpen, setIsOpen] = useState2(false);
  const [favorites, setFavorites] = useState2([]);
  const [selectedTab, setSelectedTab] = useState2("all");
  const [selectedCategory, setSelectedCategory] = useState2(null);
  const [applications, setApplications] = useState2([]);
  const [isLoading, setIsLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const { data: session } = useSession();
  useEffect5(() => {
    if (isOpen) {
      fetchApplications();
      fetchUserFavorites();
    }
  }, [isOpen]);
  const fetchUserFavorites = /* @__PURE__ */ __name(async () => {
    if (!session?.user?.id) {
      const storedFavorites = localStorage.getItem("captify-app-favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      return;
    }
    try {
      const response = await apiClient.run({
        service: "dynamodb",
        operation: "query",
        app: "core",
        table: "UserState",
        data: {
          IndexName: "userId-index",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": session.user.id
          }
        }
      });
      if (response?.data?.Items?.length > 0) {
        const userState = response.data.Items[0];
        if (userState?.favoriteApps) {
          setFavorites(userState.favoriteApps);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user favorites:", err);
      const storedFavorites = localStorage.getItem("captify-app-favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, "fetchUserFavorites");
  const fetchApplications = /* @__PURE__ */ __name(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.run({
        service: "dynamodb",
        operation: "scan",
        app: "core",
        table: "App"
      });
      console.log("ApplicationLauncher API Response:", response);
      const items = response?.data?.Items || [];
      if (items && items.length > 0) {
        const apps = items.map((item) => ({
          id: item.id || item.slug || item.name,
          name: item.name || item.title || "Unnamed App",
          description: item.description || "",
          iconName: item.icon || "Grid3X3",
          href: item.href || `/${item.slug || item.id || item.name}`,
          slug: item.slug || item.id,
          category: item.category || "Operations",
          isShared: item.isShared || false,
          status: item.status || "active",
          tags: item.tags || []
        }));
        console.log("Transformed apps:", apps);
        const activeApps = apps.filter((app) => app.status === "active");
        setApplications(activeApps);
      } else {
        console.log("No applications found in response");
        setApplications([]);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Failed to load applications");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, "fetchApplications");
  const toggleFavorite = /* @__PURE__ */ __name(async (appId) => {
    const newFavorites = favorites.includes(appId) ? favorites.filter((id) => id !== appId) : [...favorites, appId];
    setFavorites(newFavorites);
    localStorage.setItem("captify-app-favorites", JSON.stringify(newFavorites));
    if (session?.user?.id) {
      try {
        const queryResponse = await apiClient.run({
          service: "dynamodb",
          operation: "query",
          app: "core",
          table: "UserState",
          data: {
            IndexName: "userId-index",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
              ":userId": session.user.id
            }
          }
        });
        if (queryResponse?.data?.Items?.length > 0) {
          const userState = queryResponse.data.Items[0];
          await apiClient.run({
            service: "dynamodb",
            operation: "update",
            app: "core",
            table: "UserState",
            data: {
              key: {
                id: userState.id
              },
              updateExpression: "SET favoriteApps = :favorites, updatedAt = :updatedAt",
              expressionAttributeValues: {
                ":favorites": newFavorites,
                ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
              }
            }
          });
        } else {
          const newUserState = {
            id: `userstate-${session.user.id}-${Date.now()}`,
            slug: `userstate-${session.user.id}`,
            name: `UserState for ${session.user.email || session.user.id}`,
            app: "core",
            order: "0",
            fields: {},
            description: "User preferences and state",
            ownerId: session.user.id,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdBy: session.user.id,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedBy: session.user.id,
            userId: session.user.id,
            favoriteApps: newFavorites,
            recentApps: [],
            preferences: {}
          };
          await apiClient.run({
            service: "dynamodb",
            operation: "put",
            app: "core",
            table: "UserState",
            data: {
              item: newUserState
            }
          });
        }
      } catch (err) {
        console.error("Failed to save favorites to database:", err);
      }
    }
  }, "toggleFavorite");
  const getFilteredApplications = /* @__PURE__ */ __name(() => {
    let filtered = applications;
    if (selectedTab === "favorites") {
      filtered = applications.filter((app) => favorites.includes(app.id));
    } else if (selectedTab === "shared") {
      filtered = applications.filter((app) => app.isShared);
    }
    if (selectedCategory) {
      filtered = filtered.filter((app) => app.category === selectedCategory);
    }
    return filtered;
  }, "getFilteredApplications");
  const filteredApps = getFilteredApplications();
  const ApplicationCard = /* @__PURE__ */ __name(({ app }) => {
    const Icon2 = app.icon || getIconComponent(app.iconName);
    const isFavorite = favorites.includes(app.id);
    const isCurrent = currentApplication?.id === app.id;
    return /* @__PURE__ */ jsx16(
      "a",
      {
        href: app.href || `/${app.slug || app.id}`,
        className: cn(
          "block p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group",
          isCurrent && "bg-blue-50 dark:bg-blue-950"
        ),
        onClick: () => setIsOpen(false),
        children: /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx16(Icon2, { className: "h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" }),
          /* @__PURE__ */ jsxs8("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx16("h3", { className: "font-medium text-sm truncate", children: app.name }),
              /* @__PURE__ */ jsx16(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(app.id);
                  },
                  children: /* @__PURE__ */ jsx16(
                    Star2,
                    {
                      className: cn(
                        "h-4 w-4",
                        isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                      )
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsx16("p", { className: "text-xs text-muted-foreground truncate", children: app.description })
          ] })
        ] })
      }
    );
  }, "ApplicationCard");
  return /* @__PURE__ */ jsxs8(Popover, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx16(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx16(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "text-white hover:bg-gray-800 hover:text-white p-2",
        children: /* @__PURE__ */ jsx16(Grid3X3, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ jsx16(PopoverContent, { className: "w-[600px] p-0", align: "start", children: /* @__PURE__ */ jsxs8("div", { className: "flex h-[400px]", children: [
      /* @__PURE__ */ jsx16("div", { className: "w-48 border-r bg-gray-50 dark:bg-gray-900 p-4", children: /* @__PURE__ */ jsxs8("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs8(
          Button,
          {
            variant: selectedTab === "all" && !selectedCategory ? "secondary" : "ghost",
            size: "sm",
            className: "w-full justify-start",
            onClick: () => {
              setSelectedTab("all");
              setSelectedCategory(null);
            },
            children: [
              /* @__PURE__ */ jsx16(Home, { className: "h-4 w-4 mr-2" }),
              "All"
            ]
          }
        ),
        /* @__PURE__ */ jsxs8(
          Button,
          {
            variant: selectedTab === "favorites" ? "secondary" : "ghost",
            size: "sm",
            className: "w-full justify-start",
            onClick: () => {
              setSelectedTab("favorites");
              setSelectedCategory(null);
            },
            children: [
              /* @__PURE__ */ jsx16(Star2, { className: "h-4 w-4 mr-2" }),
              "Favorites"
            ]
          }
        ),
        /* @__PURE__ */ jsxs8(
          Button,
          {
            variant: selectedTab === "shared" ? "secondary" : "ghost",
            size: "sm",
            className: "w-full justify-start",
            onClick: () => {
              setSelectedTab("shared");
              setSelectedCategory(null);
            },
            children: [
              /* @__PURE__ */ jsx16(Users, { className: "h-4 w-4 mr-2" }),
              "Shared"
            ]
          }
        ),
        /* @__PURE__ */ jsx16(Separator2, { className: "my-2" }),
        /* @__PURE__ */ jsx16("div", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Categories" }),
        categories.map((category) => /* @__PURE__ */ jsx16(
          Button,
          {
            variant: selectedCategory === category ? "secondary" : "ghost",
            size: "sm",
            className: "w-full justify-start text-xs",
            onClick: () => {
              setSelectedTab("all");
              setSelectedCategory(category);
            },
            children: category
          },
          category
        ))
      ] }) }),
      /* @__PURE__ */ jsxs8("div", { className: "flex-1 p-4", children: [
        /* @__PURE__ */ jsxs8("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx16("h2", { className: "text-lg font-semibold", children: selectedCategory || (selectedTab === "favorites" ? "Favorite Applications" : selectedTab === "shared" ? "Shared Applications" : "All Applications") }),
          /* @__PURE__ */ jsxs8("p", { className: "text-sm text-muted-foreground", children: [
            filteredApps.length,
            " application",
            filteredApps.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx16(ScrollArea, { className: "h-[320px]", children: isLoading ? /* @__PURE__ */ jsx16("div", { className: "space-y-2", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx16("div", { className: "p-3 rounded-lg", children: /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx16(Skeleton, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxs8("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx16(Skeleton, { className: "h-4 w-32 mb-1" }),
            /* @__PURE__ */ jsx16(Skeleton, { className: "h-3 w-48" })
          ] })
        ] }) }, i)) }) : error ? /* @__PURE__ */ jsxs8("div", { className: "flex flex-col items-center justify-center h-full text-center py-8", children: [
          /* @__PURE__ */ jsx16("p", { className: "text-sm text-red-500 mb-2", children: error }),
          /* @__PURE__ */ jsxs8(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: fetchApplications,
              children: [
                /* @__PURE__ */ jsx16(Loader2, { className: "h-4 w-4 mr-2" }),
                "Retry"
              ]
            }
          )
        ] }) : filteredApps.length === 0 ? /* @__PURE__ */ jsxs8("div", { className: "flex flex-col items-center justify-center h-full text-center py-8", children: [
          /* @__PURE__ */ jsx16(Search2, { className: "h-12 w-12 text-gray-300 mb-3" }),
          /* @__PURE__ */ jsx16("p", { className: "text-sm text-muted-foreground", children: selectedTab === "favorites" ? "No favorite applications yet. Click the star icon to add favorites." : "No applications found in this category." })
        ] }) : /* @__PURE__ */ jsx16("div", { className: "space-y-1", children: filteredApps.map((app) => /* @__PURE__ */ jsx16(ApplicationCard, { app }, app.id)) }) })
      ] })
    ] }) })
  ] });
}
__name(ApplicationLauncher, "ApplicationLauncher");

// src/components/navigation/TopNavigation.tsx
import {
  Bell,
  Zap,
  User,
  LogOut,
  ChevronDown,
  Shield as Shield2,
  Settings as Settings2,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from "lucide-react";
import { jsx as jsx17, jsxs as jsxs9 } from "react/jsx-runtime";
var mockNotifications = [
  {
    id: "1",
    title: "System Update",
    message: "Platform has been updated to version 2.1.0",
    type: "success",
    timestamp: new Date(Date.now() - 1e3 * 60 * 10),
    // 10 minutes ago
    read: false
  },
  {
    id: "2",
    title: "Security Alert",
    message: "New login detected from Washington, DC",
    type: "warning",
    timestamp: new Date(Date.now() - 1e3 * 60 * 60),
    // 1 hour ago
    read: true
  },
  {
    id: "3",
    title: "Report Ready",
    message: "Your monthly analytics report is ready for download",
    type: "info",
    timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 2),
    // 2 hours ago
    read: false
  }
];
function TopNavigation({
  onSearchFocus,
  onAppMenuClick,
  currentApplication,
  session: propSession
}) {
  const router = useRouter2();
  const [notifications, setNotifications] = useState3(mockNotifications);
  const session = propSession || null;
  const isAuthenticated = !!session;
  const user = session?.user;
  console.log("\u{1F680} TopNavigation RENDER:", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    hasSession: !!session,
    userId: user?.id,
    userEmail: user?.email,
    currentApplication: currentApplication?.name,
    stackTrace: new Error().stack?.split("\n").slice(1, 4).join("\n")
  });
  const renderCount = useSafeRef(0);
  useEffect6(() => {
    renderCount.current += 1;
  });
  const handleSignOut = /* @__PURE__ */ __name(async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          csrfToken: await fetch("/api/auth/csrf").then((res) => res.json()).then((data) => data.csrfToken)
        })
      });
      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        throw new Error(`SignOut failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error signing out:", error);
      try {
        await signOut2({ redirect: false });
        router.push("/");
        router.refresh();
      } catch (fallbackError) {
        console.error("Fallback signout failed:", fallbackError);
        if (typeof window !== "undefined") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.location.href = "/";
        }
      }
    }
  }, "handleSignOut");
  const markAsRead = /* @__PURE__ */ __name((notificationId) => {
    setNotifications(
      (prev) => prev.map(
        (notification) => notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  }, "markAsRead");
  const dismissNotification = /* @__PURE__ */ __name((notificationId) => {
    setNotifications(
      (prev) => prev.filter((notification) => notification.id !== notificationId)
    );
  }, "dismissNotification");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const formatTimeAgo = /* @__PURE__ */ __name((timestamp) => {
    const now = /* @__PURE__ */ new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1e3 * 60));
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, "formatTimeAgo");
  return /* @__PURE__ */ jsx17("div", { children: /* @__PURE__ */ jsx17("div", { className: "bg-black text-white", children: /* @__PURE__ */ jsxs9("div", { className: "flex items-center px-4 h-12 gap-4", children: [
    /* @__PURE__ */ jsx17("div", { className: "flex items-center space-x-3 flex-shrink-0", children: /* @__PURE__ */ jsxs9("span", { className: "font-medium whitespace-nowrap", children: [
      /* @__PURE__ */ jsx17("span", { className: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]", children: "AFSC" }),
      /* @__PURE__ */ jsx17("span", { className: "text-white ml-1", children: "TITAN" })
    ] }) }),
    /* @__PURE__ */ jsx17("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx17(ApplicationLauncher, { currentApplication }) }),
    /* @__PURE__ */ jsx17("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx17(GlobalSearch, { onFocus: onSearchFocus }) }),
    /* @__PURE__ */ jsxs9("div", { className: "flex items-center space-x-3 flex-shrink-0", children: [
      /* @__PURE__ */ jsx17(ThemeToggle, {}),
      /* @__PURE__ */ jsxs9(DropdownMenu, { children: [
        /* @__PURE__ */ jsx17(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs9(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-white hover:bg-gray-800 hover:text-white p-2 cursor-pointer relative",
            children: [
              /* @__PURE__ */ jsx17(Bell, { className: "h-4 w-4" }),
              unreadCount > 0 && /* @__PURE__ */ jsx17("span", { className: "absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center", children: unreadCount > 9 ? "9+" : unreadCount })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs9(DropdownMenuContent, { align: "end", className: "w-80", children: [
          /* @__PURE__ */ jsxs9(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx17("span", { children: "Notifications" }),
            unreadCount > 0 && /* @__PURE__ */ jsxs9("span", { className: "text-xs text-muted-foreground", children: [
              unreadCount,
              " unread"
            ] })
          ] }),
          /* @__PURE__ */ jsx17(DropdownMenuSeparator, {}),
          notifications.length === 0 ? /* @__PURE__ */ jsxs9("div", { className: "p-4 text-center text-muted-foreground", children: [
            /* @__PURE__ */ jsx17(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
            /* @__PURE__ */ jsx17("p", { children: "No notifications" })
          ] }) : /* @__PURE__ */ jsx17("div", { className: "max-h-80 overflow-y-auto", children: notifications.map((notification) => /* @__PURE__ */ jsx17(
            "div",
            {
              className: `p-3 border-b last:border-b-0 hover:bg-accent/50 ${!notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`,
              children: /* @__PURE__ */ jsxs9("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxs9("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 mb-1", children: [
                    notification.type === "success" && /* @__PURE__ */ jsx17(CheckCircle, { className: "h-4 w-4 text-green-500" }),
                    notification.type === "warning" && /* @__PURE__ */ jsx17(AlertCircle, { className: "h-4 w-4 text-yellow-500" }),
                    notification.type === "info" && /* @__PURE__ */ jsx17(Clock, { className: "h-4 w-4 text-blue-500" }),
                    /* @__PURE__ */ jsx17("h4", { className: "font-medium text-sm truncate", children: notification.title }),
                    !notification.read && /* @__PURE__ */ jsx17("div", { className: "h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" })
                  ] }),
                  /* @__PURE__ */ jsx17("p", { className: "text-xs text-muted-foreground mb-1", children: notification.message }),
                  /* @__PURE__ */ jsx17("span", { className: "text-xs text-muted-foreground", children: formatTimeAgo(notification.timestamp) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "flex gap-1", children: [
                  !notification.read && /* @__PURE__ */ jsx17(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => markAsRead(notification.id),
                      className: "h-6 w-6 p-0 hover:bg-accent",
                      title: "Mark as read",
                      children: /* @__PURE__ */ jsx17(CheckCircle, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsx17(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => dismissNotification(notification.id),
                      className: "h-6 w-6 p-0 hover:bg-accent",
                      title: "Dismiss",
                      children: /* @__PURE__ */ jsx17(X, { className: "h-3 w-3" })
                    }
                  )
                ] })
              ] })
            },
            notification.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md border border-gray-700 whitespace-nowrap", children: [
        /* @__PURE__ */ jsx17(Zap, { className: "h-4 w-4 text-yellow-400" }),
        /* @__PURE__ */ jsx17("span", { className: "text-sm font-medium text-white", children: "4,600" }),
        /* @__PURE__ */ jsx17("span", { className: "text-xs text-gray-400", children: "tokens" })
      ] }),
      /* @__PURE__ */ jsx17("div", { className: "relative", children: /* @__PURE__ */ jsxs9(DropdownMenu, { children: [
        /* @__PURE__ */ jsx17(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs9(
          Button,
          {
            variant: "ghost",
            className: "flex items-center space-x-2 text-white hover:bg-gray-800 hover:text-white px-3 py-2 h-auto",
            children: [
              /* @__PURE__ */ jsxs9(Avatar, { className: "h-8 w-8", children: [
                /* @__PURE__ */ jsx17(
                  AvatarImage,
                  {
                    src: session?.user?.image || void 0,
                    alt: session?.user?.name || "User"
                  }
                ),
                /* @__PURE__ */ jsx17(AvatarFallback, { className: "bg-blue-600 text-white text-sm", children: (user?.name || session?.user?.name) && user?.name !== user?.email && session?.user?.name !== session?.user?.email ? (user?.name || session?.user?.name || "").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : user?.email || session?.user?.email ? (user?.email || session?.user?.email || "").split("@")[0]?.slice(0, 2)?.toUpperCase() : isAuthenticated ? "AU" : "U" })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "flex flex-col items-start text-left min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx17("span", { className: "text-sm font-medium truncate max-w-full", children: user?.name || session?.user?.name || user?.email?.split("@")[0] || session?.user?.email?.split("@")[0] || "User" }),
                (user?.email || session?.user?.email) && /* @__PURE__ */ jsx17("span", { className: "text-xs text-gray-300 truncate max-w-full", children: user?.email || session?.user?.email })
              ] }),
              /* @__PURE__ */ jsx17(ChevronDown, { className: "h-4 w-4 text-gray-300" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs9(DropdownMenuContent, { align: "end", className: "w-64", children: [
          /* @__PURE__ */ jsx17(DropdownMenuLabel, { className: "p-4", children: /* @__PURE__ */ jsxs9("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxs9(Avatar, { className: "h-10 w-10", children: [
              /* @__PURE__ */ jsx17(
                AvatarImage,
                {
                  src: session?.user?.image || void 0,
                  alt: session?.user?.name || "User"
                }
              ),
              /* @__PURE__ */ jsx17(AvatarFallback, { className: "bg-blue-600 text-white", children: session?.user?.name && session?.user?.name !== session?.user?.email ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : session?.user?.email?.split("@")[0]?.slice(0, 2)?.toUpperCase() || "U" })
            ] }),
            /* @__PURE__ */ jsxs9("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx17("span", { className: "font-medium text-popover-foreground", children: session?.user?.name || session?.user?.email?.split("@")[0] || "User" }),
              session?.user?.email && /* @__PURE__ */ jsx17("span", { className: "text-sm text-muted-foreground", children: session.user.email })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx17(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs9(
            DropdownMenuItem,
            {
              onClick: () => router.push("/profile"),
              className: "flex items-center space-x-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx17(User, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx17("span", { children: "Profile" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs9(
            DropdownMenuItem,
            {
              onClick: () => router.push("/settings"),
              className: "flex items-center space-x-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx17(Settings2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx17("span", { children: "Settings" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs9(
            DropdownMenuItem,
            {
              onClick: () => router.push("/admin"),
              className: "flex items-center space-x-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx17(Shield2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx17("span", { children: "Platform Admin" })
              ]
            }
          ),
          /* @__PURE__ */ jsx17(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs9(
            DropdownMenuItem,
            {
              onClick: handleSignOut,
              className: "flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50",
              children: [
                /* @__PURE__ */ jsx17(LogOut, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx17("span", { children: "Sign Out" })
              ]
            }
          )
        ] })
      ] }) })
    ] })
  ] }) }) });
}
__name(TopNavigation, "TopNavigation");

// src/components/layout/CaptifyLayout.tsx
import { ThemeProvider } from "next-themes";
import { Fragment as Fragment2, jsx as jsx18, jsxs as jsxs10 } from "react/jsx-runtime";
function AuthWrapper({ children }) {
  const { session, isLoading } = useCaptify();
  if (isLoading) {
    return /* @__PURE__ */ jsx18("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx18("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" }) });
  }
  if (!session) {
    return /* @__PURE__ */ jsx18(SignInForm, { callbackUrl: "/" });
  }
  console.log("\u{1F504} AuthWrapper rendering TopNavigation:", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    hasSession: !!session,
    userId: session?.user?.id,
    pathname: typeof window !== "undefined" ? window.location.pathname : "SSR"
  });
  return /* @__PURE__ */ jsxs10(Fragment2, { children: [
    /* @__PURE__ */ jsx18(TopNavigation, { session }),
    /* @__PURE__ */ jsx18(FavoritesBar, {}),
    children
  ] });
}
__name(AuthWrapper, "AuthWrapper");
function CaptifyProviders({ children }) {
  return /* @__PURE__ */ jsx18(
    ThemeProvider,
    {
      attribute: "class",
      defaultTheme: "system",
      enableSystem: true,
      disableTransitionOnChange: true,
      storageKey: "captify-theme",
      children: /* @__PURE__ */ jsx18(AuthWrapper, { children })
    }
  );
}
__name(CaptifyProviders, "CaptifyProviders");

// src/components/layout/ThreePanelLayout.tsx
import React21, { useCallback as useCallback7, useEffect as useEffect13 } from "react";

// src/components/packages/PackageContentPanel.tsx
import { Suspense as Suspense3, useEffect as useEffect8, useRef as useRef2 } from "react";

// src/components/packages/PackagePageRouter.tsx
import React14, { useEffect as useEffect7, useState as useState4, Suspense as Suspense2 } from "react";

// src/components/packages/PackageRegistry.tsx
async function loadPackageRegistry(packageName) {
  if (typeof window === "undefined") {
    return null;
  }
  console.log(`[PackageRegistry] Loading package: ${packageName}`);
  try {
    console.log(`[PackageRegistry] Importing package module for: ${packageName}`);
    const appModule = await import(`@captify-io/${packageName}`).catch(() => null);
    if (!appModule) {
      console.warn(`Package @captify-io/${packageName} not available`);
      return null;
    }
    console.log(`[PackageRegistry] Package module loaded:`, appModule);
    const { pageRegistry, componentRegistry } = appModule;
    if (pageRegistry || componentRegistry) {
      console.log(`[PackageRegistry] Available pageRegistry:`, Object.keys(pageRegistry || {}));
      console.log(`[PackageRegistry] Available componentRegistry:`, Object.keys(componentRegistry || {}));
      return async (routeName) => {
        console.log(`[PackageRegistry] Looking for route: "${routeName}"`);
        const componentOrLoader = pageRegistry?.[routeName] || componentRegistry?.[routeName];
        if (componentOrLoader) {
          console.log(`[PackageRegistry] Found entry for route: ${routeName}`);
          if (typeof componentOrLoader === "function") {
            try {
              const result = componentOrLoader();
              if (result && typeof result.then === "function") {
                console.log(`[PackageRegistry] Loading dynamic import for: ${routeName}`);
                const module = await result;
                const Component = module.default || module[Object.keys(module)[0]];
                console.log(`[PackageRegistry] Dynamic import loaded for: ${routeName}`);
                return Component;
              } else {
                console.log(`[PackageRegistry] Returning direct component for: ${routeName}`);
                return componentOrLoader;
              }
            } catch (error) {
              console.log(`[PackageRegistry] Returning as React component for: ${routeName}`);
              return componentOrLoader;
            }
          } else if (typeof componentOrLoader === "string") {
            console.error(`[PackageRegistry] Invalid string path for ${routeName}: ${componentOrLoader}. Apps must export React components or dynamic imports.`);
            return null;
          }
        }
        console.log(`[PackageRegistry] No component found for route: ${routeName}`);
        return null;
      };
    } else {
      return null;
    }
  } catch (error) {
    console.warn(`Failed to load package registry for ${packageName}:`, error);
    return null;
  }
}
__name(loadPackageRegistry, "loadPackageRegistry");

// src/components/packages/PackagePageRouter.tsx
import { jsx as jsx19, jsxs as jsxs11 } from "react/jsx-runtime";
function PackagePageRouter({
  currentHash = "home",
  packageSlug = "core",
  packageName = "Core"
}) {
  const [PageComponent, setPageComponent] = useState4(null);
  const [error, setError] = useState4(null);
  React14.useLayoutEffect(() => {
    console.log(`[PackagePageRouter] Package: ${packageSlug}, Hash: ${currentHash}`);
  }, [packageSlug, currentHash]);
  useEffect7(() => {
    const loadPage = /* @__PURE__ */ __name(async () => {
      try {
        console.log(`[PackagePageRouter] Loading page: packageSlug="${packageSlug}", currentHash="${currentHash}"`);
        const loadComponent = await loadPackageRegistry(packageSlug);
        if (!loadComponent) {
          console.warn(`[PackagePageRouter] Package ${packageSlug} not found in registry`);
          setError(`Package ${packageSlug} not found`);
          return;
        }
        console.log(`[PackagePageRouter] Package registry loaded, attempting to load component for "${currentHash}"`);
        const component = await loadComponent(currentHash);
        if (component) {
          console.log(`[PackagePageRouter] Successfully loaded component for "${currentHash}"`);
          setPageComponent(() => component);
          setError(null);
        } else {
          console.warn(`[PackagePageRouter] Component not found for route "${currentHash}"`);
          setError(`Page "${currentHash}" not found`);
        }
      } catch (err) {
        console.error(`[PackagePageRouter] Error loading page:`, err);
        setError(`Failed to load page: ${err}`);
      }
    }, "loadPage");
    loadPage();
  }, [currentHash, packageSlug]);
  if (error) {
    return /* @__PURE__ */ jsx19("div", { className: "flex items-center justify-center h-full p-6", children: /* @__PURE__ */ jsxs11("div", { className: "text-center max-w-2xl", children: [
      /* @__PURE__ */ jsx19("h2", { className: "text-2xl font-bold mb-2", children: "Page Not Found" }),
      /* @__PURE__ */ jsx19("p", { className: "text-muted-foreground", children: error })
    ] }) });
  }
  if (!PageComponent) {
    return /* @__PURE__ */ jsx19("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx19("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsx19(Suspense2, { fallback: /* @__PURE__ */ jsx19("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx19("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }), children: /* @__PURE__ */ jsx19(PageComponent, {}) });
}
__name(PackagePageRouter, "PackagePageRouter");

// src/components/packages/PackageContentPanel.tsx
import { jsx as jsx20, jsxs as jsxs12 } from "react/jsx-runtime";
function PackageContentPanel({
  children,
  currentHash,
  packageSlug,
  packageName
}) {
  const prevHashRef = useRef2(void 0);
  useEffect8(() => {
    try {
      if (typeof window !== "undefined" && prevHashRef.current !== currentHash) {
        prevHashRef.current = currentHash;
      }
    } catch (error) {
      console.warn("Hash tracking failed:", error);
    }
  }, [currentHash]);
  return /* @__PURE__ */ jsx20("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsx20("div", { className: "flex-1 overflow-y-auto overflow-x-hidden", children: /* @__PURE__ */ jsx20(
    Suspense3,
    {
      fallback: /* @__PURE__ */ jsx20("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxs12("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx20("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }),
        /* @__PURE__ */ jsx20("p", { className: "text-muted-foreground", children: "Loading content..." })
      ] }) }),
      children: /* @__PURE__ */ jsx20(
        PackagePageRouter,
        {
          currentHash,
          packageSlug,
          packageName
        }
      )
    }
  ) }) });
}
__name(PackageContentPanel, "PackageContentPanel");

// src/components/packages/PackageAgentPanel.tsx
import { useRef as useRef3, useEffect as useEffect9 } from "react";
import { Send, Settings as Settings3, Bot as Bot2 } from "lucide-react";
import { jsx as jsx21, jsxs as jsxs13 } from "react/jsx-runtime";
function PackageAgentPanel({ packageInfo }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef3(null);
  const scrollToBottom = /* @__PURE__ */ __name(() => {
    try {
      if (typeof window !== "undefined" && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.warn("ScrollToBottom failed:", error);
    }
  }, "scrollToBottom");
  useEffect9(() => {
    if (typeof window !== "undefined") {
      scrollToBottom();
    }
  }, [chatHistory]);
  const sendMessage = /* @__PURE__ */ __name(async (message) => {
    if (!packageInfo?.agentConfig) {
      console.warn("No agent config available");
      return;
    }
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: /* @__PURE__ */ new Date()
    };
    setChatHistory((prev) => [...prev, userMessage]);
    try {
      setTimeout(() => {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I received your message: "${message}". This is a placeholder response since agent integration needs to be implemented.`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
      }, 1e3);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, "sendMessage");
  const handleSendMessage = /* @__PURE__ */ __name(async () => {
    if (!inputMessage.trim() || isLoading) return;
    const message = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, "handleSendMessage");
  const handleKeyPress = /* @__PURE__ */ __name((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, "handleKeyPress");
  return /* @__PURE__ */ jsxs13("div", { className: "flex flex-col h-full bg-background", children: [
    /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between p-4", children: [
      /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx21(Bot2, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxs13("div", { children: [
          /* @__PURE__ */ jsx21("h3", { className: "font-semibold", children: "AI Assistant" }),
          packageInfo?.agentConfig && /* @__PURE__ */ jsxs13("p", { className: "text-xs text-muted-foreground", children: [
            packageInfo.name,
            " Agent"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx21("div", { className: "flex items-center space-x-1", children: /* @__PURE__ */ jsx21(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx21(Settings3, { className: "h-4 w-4" }) }) })
    ] }),
    /* @__PURE__ */ jsxs13("div", { className: "flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4", children: [
      chatHistory.length === 0 && /* @__PURE__ */ jsxs13("div", { className: "text-center text-muted-foreground py-8", children: [
        /* @__PURE__ */ jsx21(Bot2, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsxs13("p", { className: "text-sm", children: [
          "Hi! I'm your ",
          packageInfo?.name || "package",
          " assistant.",
          /* @__PURE__ */ jsx21("br", {}),
          "How can I help you today?"
        ] })
      ] }),
      chatHistory.map((message) => /* @__PURE__ */ jsx21(
        "div",
        {
          className: cn(
            "flex",
            message.role === "user" ? "justify-end" : "justify-start"
          ),
          children: /* @__PURE__ */ jsx21(
            "div",
            {
              className: cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              ),
              children: message.content
            }
          )
        },
        message.id
      )),
      isLoading && /* @__PURE__ */ jsx21("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx21("div", { className: "bg-muted rounded-lg px-3 py-2 text-sm", children: /* @__PURE__ */ jsxs13("div", { className: "flex space-x-1", children: [
        /* @__PURE__ */ jsx21("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }),
        /* @__PURE__ */ jsx21(
          "div",
          {
            className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
            style: { animationDelay: "0.1s" }
          }
        ),
        /* @__PURE__ */ jsx21(
          "div",
          {
            className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
            style: { animationDelay: "0.2s" }
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsx21("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx21("div", { className: "p-4 border-t border-border", children: /* @__PURE__ */ jsxs13("div", { className: "flex space-x-2", children: [
      /* @__PURE__ */ jsx21(
        Input,
        {
          value: inputMessage,
          onChange: (e) => setInputMessage(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Ask me anything...",
          disabled: isLoading,
          className: "flex-1"
        }
      ),
      /* @__PURE__ */ jsx21(
        Button,
        {
          onClick: handleSendMessage,
          disabled: !inputMessage.trim() || isLoading,
          size: "sm",
          children: /* @__PURE__ */ jsx21(Send, { className: "h-4 w-4" })
        }
      )
    ] }) })
  ] });
}
__name(PackageAgentPanel, "PackageAgentPanel");

// src/components/layout/ThreePanelLayout.tsx
import { ChevronRight as ChevronRight4, Bot as Bot3, ChevronDown as ChevronDown2, Loader2 as Loader22 } from "lucide-react";
import { DynamicIcon as DynamicIcon2 } from "lucide-react/dynamic";

// src/components/ui/sidebar.tsx
import * as React20 from "react";
import { Slot as Slot3 } from "@radix-ui/react-slot";
import { cva as cva3 } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

// src/hooks/use-mobile.ts
import * as React17 from "react";
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React17.useState(
    void 0
  );
  React17.useEffect(() => {
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

// src/components/ui/sheet.tsx
import * as React18 from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva as cva2 } from "class-variance-authority";
import { X as X3 } from "lucide-react";
import { jsx as jsx22, jsxs as jsxs14 } from "react/jsx-runtime";
var Sheet = SheetPrimitive.Root;
var SheetTrigger = SheetPrimitive.Trigger;
var SheetClose = SheetPrimitive.Close;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx22(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva2(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
var SheetContent = React18.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs14(SheetPortal, { children: [
  /* @__PURE__ */ jsx22(SheetOverlay, {}),
  /* @__PURE__ */ jsxs14(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxs14(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsx22(X3, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx22("span", { className: "sr-only", children: "Close" })
        ] }),
        children
      ]
    }
  )
] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx22(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
), "SheetHeader");
SheetHeader.displayName = "SheetHeader";
var SheetFooter = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx22(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
), "SheetFooter");
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx22(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx22(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// src/components/ui/tooltip.tsx
import * as React19 from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx23 } from "react/jsx-runtime";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React19.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx23(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx23(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// src/components/ui/sidebar.tsx
import { jsx as jsx24, jsxs as jsxs15 } from "react/jsx-runtime";
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React20.createContext(null);
function useSidebar() {
  const context = React20.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
__name(useSidebar, "useSidebar");
var SidebarProvider = React20.forwardRef(
  ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = useState(false);
    const [_open, _setOpen] = useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React20.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = React20.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    React20.useEffect(() => {
      const handleKeyDown = /* @__PURE__ */ __name((event) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      }, "handleKeyDown");
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = React20.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );
    return /* @__PURE__ */ jsx24(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx24(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx24(
      "div",
      {
        style: {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style
        },
        className: cn(
          "group/sidebar-wrapper flex h-full w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        ),
        ref,
        ...props,
        children
      }
    ) }) });
  }
);
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = React20.forwardRef(
  ({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
      return /* @__PURE__ */ jsx24(
        "div",
        {
          className: cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          ),
          ref,
          ...props,
          children
        }
      );
    }
    if (isMobile) {
      return /* @__PURE__ */ jsx24(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs15(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-mobile": "true",
          className: "w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: [
            /* @__PURE__ */ jsxs15(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsx24(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsx24(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsx24("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxs15(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsx24(
            "div",
            {
              className: cn(
                "relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
              )
            }
          ),
          /* @__PURE__ */ jsx24(
            "div",
            {
              className: cn(
                "relative z-10 h-full w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear flex",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsx24(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                  children
                }
              )
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
var SidebarTrigger = React20.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs15(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx24(PanelLeft, {}),
        /* @__PURE__ */ jsx24("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = React20.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx24(
    "button",
    {
      ref,
      "data-sidebar": "rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle Sidebar",
      className: cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
});
SidebarRail.displayName = "SidebarRail";
var SidebarInset = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    "main",
    {
      ref,
      className: cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      ),
      ...props
    }
  );
});
SidebarInset.displayName = "SidebarInset";
var SidebarInput = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    Input,
    {
      ref,
      "data-sidebar": "input",
      className: cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      ),
      ...props
    }
  );
});
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    "div",
    {
      ref,
      "data-sidebar": "header",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    "div",
    {
      ref,
      "data-sidebar": "footer",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    Separator2,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    "div",
    {
      ref,
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
});
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx24(
    "div",
    {
      ref,
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
});
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = React20.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot3 : "div";
  return /* @__PURE__ */ jsx24(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = React20.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot3 : "button";
  return /* @__PURE__ */ jsx24(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = React20.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  "div",
  {
    ref,
    "data-sidebar": "group-content",
    className: cn("w-full text-sm", className),
    ...props
  }
));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = React20.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  "ul",
  {
    ref,
    "data-sidebar": "menu",
    className: cn("flex w-full min-w-0 flex-col gap-1", className),
    ...props
  }
));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = React20.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  "li",
  {
    ref,
    "data-sidebar": "menu-item",
    className: cn("group/menu-item relative", className),
    ...props
  }
));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva3(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var SidebarMenuButton = React20.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot3 : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsx24(
      Comp,
      {
        ref,
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        ...props
      }
    );
    if (!tooltip) {
      return button;
    }
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }
    return /* @__PURE__ */ jsxs15(Tooltip, { children: [
      /* @__PURE__ */ jsx24(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsx24(
        TooltipContent,
        {
          side: "right",
          align: "center",
          hidden: state !== "collapsed" || isMobile,
          ...tooltip
        }
      )
    ] });
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = React20.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot3 : "button";
  return /* @__PURE__ */ jsx24(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = React20.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  "div",
  {
    ref,
    "data-sidebar": "menu-badge",
    className: cn(
      "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    ),
    ...props
  }
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = React20.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React20.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs15(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsx24(
          Skeleton,
          {
            className: "size-4 rounded-md",
            "data-sidebar": "menu-skeleton-icon"
          }
        ),
        /* @__PURE__ */ jsx24(
          Skeleton,
          {
            className: "h-4 max-w-[--skeleton-width] flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = React20.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  "ul",
  {
    ref,
    "data-sidebar": "menu-sub",
    className: cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    ),
    ...props
  }
));
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = React20.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx24("li", { ref, ...props }));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = React20.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot3 : "a";
  return /* @__PURE__ */ jsx24(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

// src/components/ui/collapsible.tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
var Collapsible = CollapsiblePrimitive.Root;
var CollapsibleTrigger2 = CollapsiblePrimitive.CollapsibleTrigger;
var CollapsibleContent2 = CollapsiblePrimitive.CollapsibleContent;

// src/components/layout/ThreePanelLayout.tsx
import { useRouter as useRouter3, usePathname as usePathname2 } from "next/navigation";

// src/hooks/useApi.ts
import { useState as useState6, useCallback as useCallback5 } from "react";
function useApi(apiCall) {
  const [state, setState] = useState6({
    data: null,
    loading: false,
    error: null
  });
  const execute = useCallback5(
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
  const reset = useCallback5(() => {
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

// src/hooks/useAppContext.ts
import { useState as useState7, useEffect as useEffect12, useCallback as useCallback6 } from "react";
import { useSession as useSession2 } from "next-auth/react";
function useAppContext() {
  const { data: session } = useSession2();
  const [availableApps, setAvailableApps] = useState7([]);
  const [appsLoading, setAppsLoading] = useState7(false);
  const [currentApp, setCurrentAppState] = useState7(void 0);
  const fetchAvailableApps = useCallback6(async () => {
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
  useEffect12(() => {
    if (session?.user) {
      fetchAvailableApps();
    }
  }, [session?.user, fetchAvailableApps]);
  const setCurrentApp = useCallback6((app) => {
    setCurrentAppState(app);
  }, []);
  const getCurrentAppConfig = useCallback6(() => {
    return currentApp;
  }, [currentApp]);
  const getCurrentIdentityPoolId = useCallback6(() => {
    if (currentApp?.identityPoolId) {
      return currentApp.identityPoolId;
    }
    const coreApp = availableApps.find((app) => app.slug === "core");
    return coreApp?.identityPoolId;
  }, [currentApp, availableApps]);
  const getAppBySlug = useCallback6(
    (slug) => {
      return availableApps.find((app) => app.slug === slug);
    },
    [availableApps]
  );
  const isAppAvailable = useCallback6(
    (slug) => {
      return availableApps.some(
        (app) => app.slug === slug && app.status === "active"
      );
    },
    [availableApps]
  );
  const getAppAwsConfig = useCallback6(
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

// src/components/layout/ThreePanelLayout.tsx
import { jsx as jsx25, jsxs as jsxs16 } from "react/jsx-runtime";
var ThreePanelContent = React21.memo(/* @__PURE__ */ __name(function ThreePanelContent2({
  children,
  className
}) {
  const { session } = useCaptify();
  const { setCurrentApp } = useAppContext();
  const [isResizingAgent, setIsResizingAgent] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentWidth, setLocalAgentWidth] = useState(320);
  const { toggleSidebar, state } = useSidebar();
  const [appData, setAppData] = useState(null);
  const [currentHash, setCurrentHash] = useState(() => {
    if (typeof window !== "undefined") {
      const initialHash = window.location.hash.slice(1) || "home";
      return initialHash;
    }
    return "home";
  });
  const router = useRouter3();
  const pathname = usePathname2();
  const packageSlug = pathname ? pathname.split("/").filter(Boolean)[0] : null;
  const handleToggleAgentPanel = /* @__PURE__ */ __name(() => {
    setAgentPanelOpen(!agentPanelOpen);
  }, "handleToggleAgentPanel");
  const handleSetAgentWidth = useCallback7((width) => {
    setLocalAgentWidth(width);
  }, []);
  const {
    data: apiData,
    loading,
    error,
    execute: fetchAppData
  } = useApi(async (client, appSlug) => {
    return client.run({
      service: "dynamo",
      operation: "query",
      app: "core",
      table: "App",
      data: {
        IndexName: "slug-order-index",
        KeyConditionExpression: "slug = :slug",
        ExpressionAttributeValues: {
          ":slug": appSlug
        },
        Limit: 1
      }
    });
  });
  useEffect13(() => {
    const updateHash = /* @__PURE__ */ __name(() => {
      const hash = window.location.hash.slice(1) || "home";
      setCurrentHash((prevHash) => {
        if (hash !== prevHash) {
          return hash;
        } else {
          return prevHash;
        }
      });
    }, "updateHash");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);
  useEffect13(() => {
  }, [currentHash]);
  useEffect13(() => {
    if (packageSlug && typeof window !== "undefined") {
      fetchAppData(packageSlug);
    }
  }, [packageSlug]);
  useEffect13(() => {
    if (apiData && apiData.Items && apiData.Items.length > 0) {
      const app = apiData.Items[0];
      setAppData(app);
      if (setCurrentApp && app) {
        setCurrentApp(app);
      }
      if (app.identityPoolId) {
        apiClient.setAppIdentityPool(app.identityPoolId, app.slug);
        console.log(`[ThreePanelLayout] Updated identity pool from DB for ${app.slug}:`, app.identityPoolId);
      }
    } else {
      setAppData(null);
    }
  }, [apiData, setCurrentApp]);
  const handleNavigation = /* @__PURE__ */ __name((route) => {
    const appSlug = packageSlug || "core";
    let routeId;
    if (route === "/") {
      routeId = "home";
    } else {
      routeId = route.substring(1).replace(/\//g, "-");
    }
    const currentPath = window.location.pathname;
    const targetPath = `/${appSlug}`;
    if (currentPath !== targetPath) {
      router.push(`${targetPath}#${routeId}`);
    } else {
      window.location.hash = routeId;
      const hashChangeEvent = new HashChangeEvent("hashchange", {
        oldURL: window.location.href,
        newURL: window.location.href
      });
      window.dispatchEvent(hashChangeEvent);
    }
  }, "handleNavigation");
  const handleSidebarMouseDown = useCallback7(
    (e) => {
      e.preventDefault();
      setIsResizingSidebar(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      const handleMouseMove = /* @__PURE__ */ __name((e2) => {
        const deltaX = e2.clientX - startX;
        const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
        setSidebarWidth(newWidth);
      }, "handleMouseMove");
      const handleMouseUp = /* @__PURE__ */ __name(() => {
        setIsResizingSidebar(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }, "handleMouseUp");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [sidebarWidth]
  );
  const handleAgentMouseDown = useCallback7(
    (e) => {
      e.preventDefault();
      setIsResizingAgent(true);
      const startX = e.clientX;
      const startWidth = agentWidth || 320;
      const handleMouseMove = /* @__PURE__ */ __name((e2) => {
        const deltaX = startX - e2.clientX;
        const newWidth = Math.max(250, Math.min(600, startWidth + deltaX));
        setLocalAgentWidth(newWidth);
        handleSetAgentWidth(newWidth);
      }, "handleMouseMove");
      const handleMouseUp = /* @__PURE__ */ __name(() => {
        setIsResizingAgent(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }, "handleMouseUp");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [agentWidth, handleSetAgentWidth]
  );
  return /* @__PURE__ */ jsxs16("div", { className: cn("flex h-full w-full overflow-hidden", className), children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex relative", children: [
      /* @__PURE__ */ jsx25(
        Sidebar,
        {
          collapsible: "icon",
          className: "relative",
          style: { width: state === "collapsed" ? "3rem" : sidebarWidth },
          children: /* @__PURE__ */ jsxs16(SidebarContent, { className: cn(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden",
            state === "collapsed" ? "px-0" : "px-2"
          ), children: [
            /* @__PURE__ */ jsxs16("div", { className: cn(
              "flex items-center gap-1 border-b border-border pb-2 pt-2",
              state === "collapsed" ? "flex-col px-0" : "flex-row px-0"
            ), children: [
              /* @__PURE__ */ jsx25(SidebarTrigger, { className: cn(
                "h-8 w-8",
                state === "collapsed" && "mb-1"
              ) }),
              /* @__PURE__ */ jsx25(TooltipProvider, { children: /* @__PURE__ */ jsxs16(Tooltip, { children: [
                /* @__PURE__ */ jsx25(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx25(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => router.push("/"),
                    className: "h-8 w-8 p-0",
                    children: /* @__PURE__ */ jsx25(Bot3, { className: "h-4 w-4" })
                  }
                ) }),
                /* @__PURE__ */ jsx25(TooltipContent, { side: state === "collapsed" ? "right" : "bottom", children: "Home" })
              ] }) })
            ] }),
            loading ? /* @__PURE__ */ jsx25("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ jsx25(Loader22, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }) : error ? /* @__PURE__ */ jsxs16("div", { className: "p-4 text-sm text-muted-foreground", children: [
              "Error loading menu: ",
              error
            ] }) : appData && appData.menu ? /* @__PURE__ */ jsx25(SidebarGroup, { children: /* @__PURE__ */ jsx25(SidebarGroupContent, { children: /* @__PURE__ */ jsx25(SidebarMenu, { children: appData.menu.sort((a, b) => a.order - b.order).map((menuItem) => {
              const hasChildren = menuItem.children && menuItem.children.length > 0;
              if (hasChildren) {
                if (state === "collapsed") {
                  return menuItem.children.sort((a, b) => a.order - b.order).map((child) => {
                    const childButton = /* @__PURE__ */ jsx25(
                      SidebarMenuButton,
                      {
                        onClick: () => handleNavigation(child.href),
                        className: "flex items-center justify-center w-full h-10",
                        children: /* @__PURE__ */ jsx25(
                          DynamicIcon2,
                          {
                            name: child.icon,
                            className: "h-4 w-4"
                          }
                        )
                      }
                    );
                    return /* @__PURE__ */ jsx25(SidebarMenuItem, { children: /* @__PURE__ */ jsxs16(Tooltip, { children: [
                      /* @__PURE__ */ jsx25(TooltipTrigger, { asChild: true, children: childButton }),
                      /* @__PURE__ */ jsx25(TooltipContent, { side: "right", children: child.label })
                    ] }) }, child.id);
                  });
                }
                return /* @__PURE__ */ jsx25(
                  Collapsible,
                  {
                    defaultOpen: true,
                    className: "group/collapsible",
                    children: /* @__PURE__ */ jsxs16(SidebarMenuItem, { children: [
                      /* @__PURE__ */ jsx25(CollapsibleTrigger2, { asChild: true, children: /* @__PURE__ */ jsxs16(SidebarMenuButton, { className: "flex items-center justify-between w-full", children: [
                        /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-2 min-w-0", children: [
                          /* @__PURE__ */ jsx25(
                            DynamicIcon2,
                            {
                              name: menuItem.icon,
                              className: "h-4 w-4 flex-shrink-0"
                            }
                          ),
                          /* @__PURE__ */ jsx25("span", { className: "truncate", children: menuItem.label })
                        ] }),
                        /* @__PURE__ */ jsx25(ChevronDown2, { className: "h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" })
                      ] }) }),
                      /* @__PURE__ */ jsx25(CollapsibleContent2, { children: /* @__PURE__ */ jsx25(SidebarMenuSub, { children: menuItem.children.sort(
                        (a, b) => a.order - b.order
                      ).map((child) => /* @__PURE__ */ jsx25(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx25(
                        SidebarMenuSubButton,
                        {
                          onClick: () => handleNavigation(child.href),
                          children: /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-2 min-w-0", children: [
                            /* @__PURE__ */ jsx25(
                              DynamicIcon2,
                              {
                                name: child.icon,
                                className: "h-4 w-4 flex-shrink-0"
                              }
                            ),
                            /* @__PURE__ */ jsx25("span", { className: "truncate", children: child.label })
                          ] })
                        }
                      ) }, child.id)) }) })
                    ] })
                  },
                  menuItem.id
                );
              } else {
                const menuButton = /* @__PURE__ */ jsxs16(
                  SidebarMenuButton,
                  {
                    onClick: () => handleNavigation(menuItem.href),
                    className: cn(
                      "flex items-center w-full",
                      state === "collapsed" ? "justify-center h-10" : "gap-2"
                    ),
                    children: [
                      /* @__PURE__ */ jsx25(
                        DynamicIcon2,
                        {
                          name: menuItem.icon,
                          className: "h-4 w-4 flex-shrink-0"
                        }
                      ),
                      state !== "collapsed" && /* @__PURE__ */ jsx25("span", { className: "truncate", children: menuItem.label })
                    ]
                  }
                );
                return /* @__PURE__ */ jsx25(SidebarMenuItem, { children: state === "collapsed" ? /* @__PURE__ */ jsxs16(Tooltip, { children: [
                  /* @__PURE__ */ jsx25(TooltipTrigger, { asChild: true, children: menuButton }),
                  /* @__PURE__ */ jsx25(TooltipContent, { side: "right", children: menuItem.label })
                ] }) : menuButton }, menuItem.id);
              }
            }) }) }) }) : null
          ] })
        }
      ),
      state !== "collapsed" && /* @__PURE__ */ jsx25(
        "div",
        {
          className: cn(
            "w-1 bg-transparent hover:bg-border cursor-col-resize transition-colors relative",
            isResizingSidebar && "bg-border"
          ),
          onMouseDown: handleSidebarMouseDown,
          children: /* @__PURE__ */ jsx25("div", { className: "absolute inset-y-0 left-0 w-1 bg-border opacity-0 hover:opacity-100 transition-opacity" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "flex flex-1 relative", children: [
      /* @__PURE__ */ jsx25(SidebarInset, { className: "flex-1 relative", children: /* @__PURE__ */ jsx25(
        PackageContentPanel,
        {
          currentHash,
          packageSlug: packageSlug || void 0,
          packageName: appData?.name,
          children
        }
      ) }),
      /* @__PURE__ */ jsx25(
        "div",
        {
          className: cn(
            "flex-shrink-0 transition-all duration-300 bg-background relative border-l",
            !agentPanelOpen && "w-0"
          ),
          style: {
            width: agentPanelOpen ? agentWidth || 320 : 0
          },
          children: agentPanelOpen && /* @__PURE__ */ jsxs16("div", { className: "flex h-full", children: [
            /* @__PURE__ */ jsx25(
              "div",
              {
                className: cn(
                  "w-0.5 bg-border hover:bg-accent cursor-col-resize transition-colors",
                  isResizingAgent && "bg-accent"
                ),
                onMouseDown: handleAgentMouseDown
              }
            ),
            /* @__PURE__ */ jsx25("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsx25(
              PackageAgentPanel,
              {
                packageInfo: appData ? {
                  name: appData.name,
                  slug: appData.slug,
                  agentConfig: {
                    agentId: appData.agentId || "",
                    agentAliasId: appData.agentAliasId || "",
                    capabilities: []
                  }
                } : void 0
              }
            ) })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx25(
      Button,
      {
        variant: "outline",
        size: "lg",
        className: "fixed bottom-6 right-6 h-14 w-14 p-0 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 z-[200]",
        onClick: handleToggleAgentPanel,
        title: agentPanelOpen ? "Close AI assistant" : "Open AI assistant",
        children: agentPanelOpen ? /* @__PURE__ */ jsx25(ChevronRight4, { className: "h-8 w-8" }) : /* @__PURE__ */ jsx25(Bot3, { className: "h-8 w-8" })
      }
    )
  ] });
}, "ThreePanelContent"));
function ThreePanelLayout({
  children,
  className
}) {
  return /* @__PURE__ */ jsx25(TooltipProvider, { children: /* @__PURE__ */ jsx25(SidebarProvider, { defaultOpen: false, children: /* @__PURE__ */ jsx25(ThreePanelContent, { className, children }) }) });
}
__name(ThreePanelLayout, "ThreePanelLayout");

// src/components/providers/ClientOnly.tsx
function ClientOnly({ children, fallback = null }) {
  if (typeof window === "undefined") {
    return fallback;
  }
  return children;
}
__name(ClientOnly, "ClientOnly");

// src/components/providers/ServerCaptifyProvider.tsx
import { jsx as jsx26 } from "react/jsx-runtime";
async function ServerCaptifyProvider({
  children
}) {
  const session = await auth();
  return /* @__PURE__ */ jsx26(CaptifyProvider, { session, children });
}
__name(ServerCaptifyProvider, "ServerCaptifyProvider");

// src/components/packages/PackageRenderer.tsx
import { lazy as lazy2, Suspense as Suspense4 } from "react";
import { jsx as jsx27, jsxs as jsxs17 } from "react/jsx-runtime";
function PackageRenderer({ packageName, params }) {
  const PackageComponent = lazy2(() => {
    return import(`@captify-io/${packageName}`).then((packageModule) => {
      if (!packageModule) {
        throw new Error(`Package @captify-io/${packageName} not available`);
      }
      if (packageModule.default) {
        return { default: packageModule.default };
      } else if (packageModule.App) {
        return { default: packageModule.App };
      } else if (packageModule[`${packageName}App`]) {
        return { default: packageModule[`${packageName}App`] };
      } else {
        return {
          default: /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxs17("div", { className: "p-4", children: [
            /* @__PURE__ */ jsxs17("h2", { className: "text-lg font-semibold mb-2", children: [
              "Package: ",
              packageName
            ] }),
            /* @__PURE__ */ jsxs17("p", { className: "text-muted-foreground", children: [
              "No main component found in @captify-io/",
              packageName
            ] }),
            /* @__PURE__ */ jsxs17("p", { className: "text-sm text-muted-foreground mt-2", children: [
              "Expected exports: default, App, or ",
              packageName,
              "App"
            ] })
          ] }), "default")
        };
      }
    }).catch((error) => {
      console.error(`Failed to load package @captify-io/${packageName}:`, error);
      return {
        default: /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxs17("div", { className: "p-4 border border-red-200 bg-red-50 rounded-lg", children: [
          /* @__PURE__ */ jsxs17("h2", { className: "text-lg font-semibold mb-2 text-red-700", children: [
            "Error Loading Package: ",
            packageName
          ] }),
          /* @__PURE__ */ jsxs17("p", { className: "text-red-600 mb-2", children: [
            "Failed to load @captify-io/",
            packageName
          ] }),
          /* @__PURE__ */ jsxs17("details", { className: "text-sm text-red-600", children: [
            /* @__PURE__ */ jsx27("summary", { className: "cursor-pointer", children: "Error Details" }),
            /* @__PURE__ */ jsx27("pre", { className: "mt-2 p-2 bg-red-100 rounded text-xs overflow-auto", children: error.toString() })
          ] })
        ] }), "default")
      };
    });
  });
  return /* @__PURE__ */ jsx27(
    Suspense4,
    {
      fallback: /* @__PURE__ */ jsxs17("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxs17("div", { className: "animate-pulse", children: [
          /* @__PURE__ */ jsx27("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }),
          /* @__PURE__ */ jsxs17("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx27("div", { className: "h-4 bg-gray-200 rounded" }),
            /* @__PURE__ */ jsx27("div", { className: "h-4 bg-gray-200 rounded w-5/6" }),
            /* @__PURE__ */ jsx27("div", { className: "h-4 bg-gray-200 rounded w-4/6" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs17("p", { className: "text-sm text-muted-foreground mt-2", children: [
          "Loading ",
          packageName,
          " package..."
        ] })
      ] }),
      children: /* @__PURE__ */ jsx27(PackageComponent, { ...params })
    }
  );
}
__name(PackageRenderer, "PackageRenderer");

// src/components/ApplicationLauncher.tsx
import { useCallback as useCallback9, useEffect as useEffect16, useState as useState8 } from "react";
import { useRouter as useRouter4, useSearchParams } from "next/navigation";

// src/components/ui/accordion.tsx
import * as React22 from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown as ChevronDown3 } from "lucide-react";
import { jsx as jsx28, jsxs as jsxs18 } from "react/jsx-runtime";
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React22.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx28(
  AccordionPrimitive.Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React22.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx28(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs18(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx28(ChevronDown3, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React22.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx28(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx28("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// src/components/ui/alert-dialog.tsx
import * as React23 from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { jsx as jsx29, jsxs as jsxs19 } from "react/jsx-runtime";
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogPortal = AlertDialogPrimitive.Portal;
var AlertDialogOverlay = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
var AlertDialogContent = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs19(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx29(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx29(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
var AlertDialogHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx29(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
), "AlertDialogHeader");
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx29(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
), "AlertDialogFooter");
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
var AlertDialogDescription = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
var AlertDialogAction = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
var AlertDialogCancel = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

// src/components/ui/alert.tsx
import * as React24 from "react";
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx30 } from "react/jsx-runtime";
var alertVariants = cva4(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Alert = React24.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx30(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
var AlertTitle = React24.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx30(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React24.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx30(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

// src/components/ui/aspect-ratio.tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
var AspectRatio = AspectRatioPrimitive.Root;

// src/components/ui/badge.tsx
import { cva as cva5 } from "class-variance-authority";
import { jsx as jsx31 } from "react/jsx-runtime";
var badgeVariants = cva5(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx31("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
__name(Badge, "Badge");

// src/components/ui/calendar.tsx
import { useRef as useRef4, useEffect as useEffect14 } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { jsx as jsx32 } from "react/jsx-runtime";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx32(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: /* @__PURE__ */ __name((date) => date.toLocaleString("default", { month: "short" }), "formatMonthDropdown"),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: /* @__PURE__ */ __name(({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx32(
            "div",
            {
              "data-slot": "calendar",
              ref: rootRef,
              className: cn(className2),
              ...props2
            }
          );
        }, "Root"),
        Chevron: /* @__PURE__ */ __name(({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx32(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx32(
              ChevronRightIcon,
              {
                className: cn("size-4", className2),
                ...props2
              }
            );
          }
          return /* @__PURE__ */ jsx32(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        }, "Chevron"),
        DayButton: CalendarDayButton,
        WeekNumber: /* @__PURE__ */ __name(({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx32("td", { ...props2, children: /* @__PURE__ */ jsx32("div", { className: "flex size-[--cell-size] items-center justify-center text-center", children }) });
        }, "WeekNumber"),
        ...components
      },
      ...props
    }
  );
}
__name(Calendar, "Calendar");
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef4(null);
  useEffect14(() => {
    if (typeof window !== "undefined" && modifiers.focused && ref.current) {
      ref.current.focus();
    }
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx32(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
__name(CalendarDayButton, "CalendarDayButton");

// src/components/ui/card.tsx
import * as React25 from "react";
import { jsx as jsx33 } from "react/jsx-runtime";
var Card = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  "div",
  {
    ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/ui/carousel.tsx
import * as React26 from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { jsx as jsx34, jsxs as jsxs20 } from "react/jsx-runtime";
var CarouselContext = React26.createContext(null);
function useCarousel() {
  const context = React26.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
__name(useCarousel, "useCarousel");
var Carousel = React26.forwardRef(
  ({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y"
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const onSelect = React26.useCallback((api2) => {
      if (!api2) {
        return;
      }
      setCanScrollPrev(api2.canScrollPrev());
      setCanScrollNext(api2.canScrollNext());
    }, []);
    const scrollPrev = React26.useCallback(() => {
      api?.scrollPrev();
    }, [api]);
    const scrollNext = React26.useCallback(() => {
      api?.scrollNext();
    }, [api]);
    const handleKeyDown = React26.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );
    React26.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);
    React26.useEffect(() => {
      if (!api) {
        return;
      }
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);
    return /* @__PURE__ */ jsx34(
      CarouselContext.Provider,
      {
        value: {
          carouselRef,
          api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext
        },
        children: /* @__PURE__ */ jsx34(
          "div",
          {
            ref,
            onKeyDownCapture: handleKeyDown,
            className: cn("relative", className),
            role: "region",
            "aria-roledescription": "carousel",
            ...props,
            children
          }
        )
      }
    );
  }
);
Carousel.displayName = "Carousel";
var CarouselContent = React26.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsx34("div", { ref: carouselRef, className: "overflow-hidden", children: /* @__PURE__ */ jsx34(
    "div",
    {
      ref,
      className: cn(
        "flex",
        orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
        className
      ),
      ...props
    }
  ) });
});
CarouselContent.displayName = "CarouselContent";
var CarouselItem = React26.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsx34(
    "div",
    {
      ref,
      role: "group",
      "aria-roledescription": "slide",
      className: cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      ),
      ...props
    }
  );
});
CarouselItem.displayName = "CarouselItem";
var CarouselPrevious = React26.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxs20(
    Button,
    {
      ref,
      variant,
      size,
      className: cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollPrev,
      onClick: scrollPrev,
      ...props,
      children: [
        /* @__PURE__ */ jsx34(ArrowLeft, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx34("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
});
CarouselPrevious.displayName = "CarouselPrevious";
var CarouselNext = React26.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxs20(
    Button,
    {
      ref,
      variant,
      size,
      className: cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollNext,
      onClick: scrollNext,
      ...props,
      children: [
        /* @__PURE__ */ jsx34(ArrowRight, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx34("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
});
CarouselNext.displayName = "CarouselNext";

// src/components/ui/chart.tsx
import * as React27 from "react";
import * as RechartsPrimitive from "recharts";
import { Fragment as Fragment3, jsx as jsx35, jsxs as jsxs21 } from "react/jsx-runtime";
var THEMES = { light: "", dark: ".dark" };
var ChartContext = React27.createContext(null);
function useChart() {
  const context = React27.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
__name(useChart, "useChart");
var ChartContainer = React27.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React27.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsx35(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxs21(
    "div",
    {
      "data-chart": chartId,
      ref,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx35(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsx35(RechartsPrimitive.ResponsiveContainer, { children })
      ]
    }
  ) });
});
ChartContainer.displayName = "Chart";
var ChartStyle = /* @__PURE__ */ __name(({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme || config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsx35(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
}, "ChartStyle");
var ChartTooltip = RechartsPrimitive.Tooltip;
var ChartTooltipContent = React27.forwardRef(
  ({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey
  }, ref) => {
    const { config } = useChart();
    const tooltipLabel = React27.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
      if (labelFormatter) {
        return /* @__PURE__ */ jsx35("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
      }
      if (!value) {
        return null;
      }
      return /* @__PURE__ */ jsx35("div", { className: cn("font-medium", labelClassName), children: value });
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey
    ]);
    if (!active || !payload?.length) {
      return null;
    }
    const nestLabel = payload.length === 1 && indicator !== "dot";
    return /* @__PURE__ */ jsxs21(
      "div",
      {
        ref,
        className: cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        ),
        children: [
          !nestLabel ? tooltipLabel : null,
          /* @__PURE__ */ jsx35("div", { className: "grid gap-1.5", children: payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;
            return /* @__PURE__ */ jsx35(
              "div",
              {
                className: cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                ),
                children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxs21(Fragment3, { children: [
                  itemConfig?.icon ? /* @__PURE__ */ jsx35(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsx35(
                    "div",
                    {
                      className: cn(
                        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed"
                        }
                      ),
                      style: {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxs21(
                    "div",
                    {
                      className: cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      ),
                      children: [
                        /* @__PURE__ */ jsxs21("div", { className: "grid gap-1.5", children: [
                          nestLabel ? tooltipLabel : null,
                          /* @__PURE__ */ jsx35("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                        ] }),
                        item.value && /* @__PURE__ */ jsx35("span", { className: "font-mono font-medium tabular-nums text-foreground", children: item.value.toLocaleString() })
                      ]
                    }
                  )
                ] })
              },
              item.dataKey
            );
          }) })
        ]
      }
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";
var ChartLegend = RechartsPrimitive.Legend;
var ChartLegendContent = React27.forwardRef(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart();
    if (!payload?.length) {
      return null;
    }
    return /* @__PURE__ */ jsx35(
      "div",
      {
        ref,
        className: cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        ),
        children: payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          return /* @__PURE__ */ jsxs21(
            "div",
            {
              className: cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              ),
              children: [
                itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsx35(itemConfig.icon, {}) : /* @__PURE__ */ jsx35(
                  "div",
                  {
                    className: "h-2 w-2 shrink-0 rounded-[2px]",
                    style: {
                      backgroundColor: item.color
                    }
                  }
                ),
                itemConfig?.label
              ]
            },
            item.value
          );
        })
      }
    );
  }
);
ChartLegendContent.displayName = "ChartLegend";
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
__name(getPayloadConfigFromPayload, "getPayloadConfigFromPayload");

// src/components/ui/checkbox.tsx
import * as React28 from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check as Check2 } from "lucide-react";
import { jsx as jsx36 } from "react/jsx-runtime";
var Checkbox = React28.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx36(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsx36(Check2, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/components/ui/command.tsx
import * as React30 from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search as Search3 } from "lucide-react";

// src/components/ui/dialog.tsx
import * as React29 from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X as X4 } from "lucide-react";
import { jsx as jsx37, jsxs as jsxs22 } from "react/jsx-runtime";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogClose = DialogPrimitive.Close;
var DialogOverlay = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx37(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React29.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs22(DialogPortal, { children: [
  /* @__PURE__ */ jsx37(DialogOverlay, {}),
  /* @__PURE__ */ jsxs22(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs22(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx37(X4, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx37("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx37(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
), "DialogHeader");
DialogHeader.displayName = "DialogHeader";
var DialogFooter = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx37(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
), "DialogFooter");
DialogFooter.displayName = "DialogFooter";
var DialogTitle = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx37(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx37(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// src/components/ui/command.tsx
import { jsx as jsx38, jsxs as jsxs23 } from "react/jsx-runtime";
var Command = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = CommandPrimitive.displayName;
var CommandDialog = /* @__PURE__ */ __name(({ children, ...props }) => {
  return /* @__PURE__ */ jsx38(Dialog, { ...props, children: /* @__PURE__ */ jsx38(DialogContent, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsx38(Command, { className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children }) }) });
}, "CommandDialog");
var CommandInput = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs23("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsx38(Search3, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsx38(
    CommandPrimitive.Input,
    {
      ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = CommandPrimitive.Input.displayName;
var CommandList = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = CommandPrimitive.List.displayName;
var CommandEmpty = React30.forwardRef((props, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive.Empty,
  {
    ref,
    className: "py-6 text-center text-sm",
    ...props
  }
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
var CommandGroup = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;
var CommandSeparator = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
var CommandItem = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx38(
  CommandPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    ),
    ...props
  }
));
CommandItem.displayName = CommandPrimitive.Item.displayName;
var CommandShortcut = /* @__PURE__ */ __name(({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx38(
    "span",
    {
      className: cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      ),
      ...props
    }
  );
}, "CommandShortcut");
CommandShortcut.displayName = "CommandShortcut";

// src/components/ui/context-menu.tsx
import * as React31 from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check as Check3, ChevronRight as ChevronRight5, Circle as Circle2 } from "lucide-react";
import { jsx as jsx39, jsxs as jsxs24 } from "react/jsx-runtime";
var ContextMenu = ContextMenuPrimitive.Root;
var ContextMenuTrigger = ContextMenuPrimitive.Trigger;
var ContextMenuGroup = ContextMenuPrimitive.Group;
var ContextMenuPortal = ContextMenuPrimitive.Portal;
var ContextMenuSub = ContextMenuPrimitive.Sub;
var ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
var ContextMenuSubTrigger = React31.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs24(
  ContextMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx39(ChevronRight5, { className: "ml-auto h-4 w-4" })
    ]
  }
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;
var ContextMenuSubContent = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx39(
  ContextMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
      className
    ),
    ...props
  }
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;
var ContextMenuContent = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx39(ContextMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx39(
  ContextMenuPrimitive.Content,
  {
    ref,
    className: cn(
      "z-50 max-h-[--radix-context-menu-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;
var ContextMenuItem = React31.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx39(
  ContextMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;
var ContextMenuCheckboxItem = React31.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs24(
  ContextMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx39("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx39(ContextMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx39(Check3, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;
var ContextMenuRadioItem = React31.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs24(
  ContextMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx39("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx39(ContextMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx39(Circle2, { className: "h-4 w-4 fill-current" }) }) }),
      children
    ]
  }
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;
var ContextMenuLabel = React31.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx39(
  ContextMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;
var ContextMenuSeparator = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx39(
  ContextMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-border", className),
    ...props
  }
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;
var ContextMenuShortcut = /* @__PURE__ */ __name(({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx39(
    "span",
    {
      className: cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      ),
      ...props
    }
  );
}, "ContextMenuShortcut");
ContextMenuShortcut.displayName = "ContextMenuShortcut";

// src/components/ui/drawer.tsx
import * as React32 from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { jsx as jsx40, jsxs as jsxs25 } from "react/jsx-runtime";
var Drawer = /* @__PURE__ */ __name(({
  shouldScaleBackground = true,
  ...props
}) => /* @__PURE__ */ jsx40(
  DrawerPrimitive.Root,
  {
    shouldScaleBackground,
    ...props
  }
), "Drawer");
Drawer.displayName = "Drawer";
var DrawerTrigger = DrawerPrimitive.Trigger;
var DrawerPortal = DrawerPrimitive.Portal;
var DrawerClose = DrawerPrimitive.Close;
var DrawerOverlay = React32.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
  DrawerPrimitive.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props
  }
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;
var DrawerContent = React32.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs25(DrawerPortal, { children: [
  /* @__PURE__ */ jsx40(DrawerOverlay, {}),
  /* @__PURE__ */ jsxs25(
    DrawerPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx40("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }),
        children
      ]
    }
  )
] }));
DrawerContent.displayName = "DrawerContent";
var DrawerHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx40(
  "div",
  {
    className: cn("grid gap-1.5 p-4 text-center sm:text-left", className),
    ...props
  }
), "DrawerHeader");
DrawerHeader.displayName = "DrawerHeader";
var DrawerFooter = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx40(
  "div",
  {
    className: cn("mt-auto flex flex-col gap-2 p-4", className),
    ...props
  }
), "DrawerFooter");
DrawerFooter.displayName = "DrawerFooter";
var DrawerTitle = React32.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
  DrawerPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;
var DrawerDescription = React32.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
  DrawerPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

// src/components/ui/index.ts
import { DynamicIcon as DynamicIcon3 } from "lucide-react/dynamic";

// src/components/ui/form.tsx
import * as React34 from "react";
import { Slot as Slot4 } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext
} from "react-hook-form";

// src/components/ui/label.tsx
import * as React33 from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva as cva6 } from "class-variance-authority";
import { jsx as jsx41 } from "react/jsx-runtime";
var labelVariants = cva6(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label3 = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx41(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label3.displayName = LabelPrimitive.Root.displayName;

// src/components/ui/form.tsx
import { jsx as jsx42 } from "react/jsx-runtime";
var Form = FormProvider;
var FormFieldContext = React34.createContext(
  {}
);
var FormField = /* @__PURE__ */ __name(({
  ...props
}) => {
  return /* @__PURE__ */ jsx42(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx42(Controller, { ...props }) });
}, "FormField");
var useFormField = /* @__PURE__ */ __name(() => {
  const fieldContext = React34.useContext(FormFieldContext);
  const itemContext = React34.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
}, "useFormField");
var FormItemContext = React34.createContext(
  {}
);
var FormItem = React34.forwardRef(({ className, ...props }, ref) => {
  const id = React34.useId();
  return /* @__PURE__ */ jsx42(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx42("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
var FormLabel = React34.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx42(
    Label3,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
var FormControl = React34.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx42(
    Slot4,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
var FormDescription = React34.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx42(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-[0.8rem] text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
var FormMessage = React34.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx42(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-[0.8rem] font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";

// src/components/ui/hover-card.tsx
import * as React35 from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { jsx as jsx43 } from "react/jsx-runtime";
var HoverCard = HoverCardPrimitive.Root;
var HoverCardTrigger = HoverCardPrimitive.Trigger;
var HoverCardContent = React35.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx43(
  HoverCardPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    ),
    ...props
  }
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// src/components/ui/input-otp.tsx
import * as React36 from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { jsx as jsx44, jsxs as jsxs26 } from "react/jsx-runtime";
var InputOTP = React36.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx44(
  OTPInput,
  {
    ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
var InputOTPGroup = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React36.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React36.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxs26(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsx44("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx44("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React36.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx44("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsx44(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";

// src/components/ui/menubar.tsx
import * as React37 from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check as Check4, ChevronRight as ChevronRight6, Circle as Circle3 } from "lucide-react";
import { jsx as jsx45, jsxs as jsxs27 } from "react/jsx-runtime";
function MenubarMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx45(MenubarPrimitive.Menu, { ...props });
}
__name(MenubarMenu, "MenubarMenu");
function MenubarGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx45(MenubarPrimitive.Group, { ...props });
}
__name(MenubarGroup, "MenubarGroup");
function MenubarPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx45(MenubarPrimitive.Portal, { ...props });
}
__name(MenubarPortal, "MenubarPortal");
function MenubarRadioGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx45(MenubarPrimitive.RadioGroup, { ...props });
}
__name(MenubarRadioGroup, "MenubarRadioGroup");
function MenubarSub({
  ...props
}) {
  return /* @__PURE__ */ jsx45(MenubarPrimitive.Sub, { "data-slot": "menubar-sub", ...props });
}
__name(MenubarSub, "MenubarSub");
var Menubar = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.Root,
  {
    ref,
    className: cn(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
      className
    ),
    ...props
  }
));
Menubar.displayName = MenubarPrimitive.Root.displayName;
var MenubarTrigger = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    ),
    ...props
  }
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;
var MenubarSubTrigger = React37.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs27(
  MenubarPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx45(ChevronRight6, { className: "ml-auto h-4 w-4" })
    ]
  }
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;
var MenubarSubContent = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
      className
    ),
    ...props
  }
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;
var MenubarContent = React37.forwardRef(
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => /* @__PURE__ */ jsx45(MenubarPrimitive.Portal, { children: /* @__PURE__ */ jsx45(
    MenubarPrimitive.Content,
    {
      ref,
      align,
      alignOffset,
      sideOffset,
      className: cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
        className
      ),
      ...props
    }
  ) })
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;
var MenubarItem = React37.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;
var MenubarCheckboxItem = React37.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs27(
  MenubarPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx45("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx45(MenubarPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx45(Check4, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;
var MenubarRadioItem = React37.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs27(
  MenubarPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx45("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx45(MenubarPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx45(Circle3, { className: "h-4 w-4 fill-current" }) }) }),
      children
    ]
  }
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;
var MenubarLabel = React37.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;
var MenubarSeparator = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx45(
  MenubarPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;
var MenubarShortcut = /* @__PURE__ */ __name(({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx45(
    "span",
    {
      className: cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      ),
      ...props
    }
  );
}, "MenubarShortcut");
MenubarShortcut.displayname = "MenubarShortcut";

// src/components/ui/navigation-menu.tsx
import * as React38 from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva as cva7 } from "class-variance-authority";
import { ChevronDown as ChevronDown4 } from "lucide-react";
import { jsx as jsx46, jsxs as jsxs28 } from "react/jsx-runtime";
var NavigationMenu = React38.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs28(
  NavigationMenuPrimitive.Root,
  {
    ref,
    className: cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx46(NavigationMenuViewport, {})
    ]
  }
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;
var NavigationMenuList = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx46(
  NavigationMenuPrimitive.List,
  {
    ref,
    className: cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    ),
    ...props
  }
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;
var NavigationMenuItem = NavigationMenuPrimitive.Item;
var navigationMenuTriggerStyle = cva7(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
);
var NavigationMenuTrigger = React38.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs28(
  NavigationMenuPrimitive.Trigger,
  {
    ref,
    className: cn(navigationMenuTriggerStyle(), "group", className),
    ...props,
    children: [
      children,
      " ",
      /* @__PURE__ */ jsx46(
        ChevronDown4,
        {
          className: "relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180",
          "aria-hidden": "true"
        }
      )
    ]
  }
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;
var NavigationMenuContent = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx46(
  NavigationMenuPrimitive.Content,
  {
    ref,
    className: cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    ),
    ...props
  }
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;
var NavigationMenuLink = NavigationMenuPrimitive.Link;
var NavigationMenuViewport = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx46("div", { className: cn("absolute left-0 top-full flex justify-center"), children: /* @__PURE__ */ jsx46(
  NavigationMenuPrimitive.Viewport,
  {
    className: cn(
      "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
      className
    ),
    ref,
    ...props
  }
) }));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;
var NavigationMenuIndicator = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx46(
  NavigationMenuPrimitive.Indicator,
  {
    ref,
    className: cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx46("div", { className: "relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" })
  }
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

// src/components/ui/pagination.tsx
import * as React39 from "react";
import { ChevronLeft as ChevronLeft2, ChevronRight as ChevronRight7, MoreHorizontal as MoreHorizontal2 } from "lucide-react";
import { jsx as jsx47, jsxs as jsxs29 } from "react/jsx-runtime";
var Pagination = /* @__PURE__ */ __name(({ className, ...props }) => /* @__PURE__ */ jsx47(
  "nav",
  {
    role: "navigation",
    "aria-label": "pagination",
    className: cn("mx-auto flex w-full justify-center", className),
    ...props
  }
), "Pagination");
Pagination.displayName = "Pagination";
var PaginationContent = React39.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx47(
  "ul",
  {
    ref,
    className: cn("flex flex-row items-center gap-1", className),
    ...props
  }
));
PaginationContent.displayName = "PaginationContent";
var PaginationItem = React39.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx47("li", { ref, className: cn("", className), ...props }));
PaginationItem.displayName = "PaginationItem";
var PaginationLink = /* @__PURE__ */ __name(({
  className,
  isActive,
  size = "icon",
  ...props
}) => /* @__PURE__ */ jsx47(
  "a",
  {
    "aria-current": isActive ? "page" : void 0,
    className: cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size
      }),
      className
    ),
    ...props
  }
), "PaginationLink");
PaginationLink.displayName = "PaginationLink";
var PaginationPrevious = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs29(
  PaginationLink,
  {
    "aria-label": "Go to previous page",
    size: "default",
    className: cn("gap-1 pl-2.5", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx47(ChevronLeft2, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx47("span", { children: "Previous" })
    ]
  }
), "PaginationPrevious");
PaginationPrevious.displayName = "PaginationPrevious";
var PaginationNext = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs29(
  PaginationLink,
  {
    "aria-label": "Go to next page",
    size: "default",
    className: cn("gap-1 pr-2.5", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx47("span", { children: "Next" }),
      /* @__PURE__ */ jsx47(ChevronRight7, { className: "h-4 w-4" })
    ]
  }
), "PaginationNext");
PaginationNext.displayName = "PaginationNext";
var PaginationEllipsis = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs29(
  "span",
  {
    "aria-hidden": true,
    className: cn("flex h-9 w-9 items-center justify-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx47(MoreHorizontal2, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx47("span", { className: "sr-only", children: "More pages" })
    ]
  }
), "PaginationEllipsis");
PaginationEllipsis.displayName = "PaginationEllipsis";

// src/components/ui/progress.tsx
import * as React40 from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { jsx as jsx48 } from "react/jsx-runtime";
var Progress = React40.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx48(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx48(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// src/components/ui/radio-group.tsx
import * as React41 from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle as Circle4 } from "lucide-react";
import { jsx as jsx49 } from "react/jsx-runtime";
var RadioGroup4 = React41.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    RadioGroupPrimitive.Root,
    {
      className: cn("grid gap-2", className),
      ...props,
      ref
    }
  );
});
RadioGroup4.displayName = RadioGroupPrimitive.Root.displayName;
var RadioGroupItem = React41.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx49(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx49(Circle4, { className: "h-3.5 w-3.5 fill-primary" }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// src/components/ui/resizable.tsx
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { jsx as jsx50 } from "react/jsx-runtime";
var ResizablePanelGroup = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx50(
  ResizablePrimitive.PanelGroup,
  {
    className: cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    ),
    ...props
  }
), "ResizablePanelGroup");
var ResizablePanel = ResizablePrimitive.Panel;
var ResizableHandle = /* @__PURE__ */ __name(({
  withHandle,
  className,
  ...props
}) => /* @__PURE__ */ jsx50(
  ResizablePrimitive.PanelResizeHandle,
  {
    className: cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    ),
    ...props,
    children: withHandle && /* @__PURE__ */ jsx50("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", children: /* @__PURE__ */ jsx50(GripVertical, { className: "h-2.5 w-2.5" }) })
  }
), "ResizableHandle");

// src/components/ui/select.tsx
import * as React42 from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check as Check5, ChevronDown as ChevronDown5, ChevronUp } from "lucide-react";
import { jsx as jsx51, jsxs as jsxs30 } from "react/jsx-runtime";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React42.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs30(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx51(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx51(ChevronDown5, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React42.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx51(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx51(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React42.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx51(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx51(ChevronDown5, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React42.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx51(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs30(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx51(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx51(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx51(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React42.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx51(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React42.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs30(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx51("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx51(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx51(Check5, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx51(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React42.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx51(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/components/ui/slider.tsx
import * as React43 from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { jsx as jsx52, jsxs as jsxs31 } from "react/jsx-runtime";
var Slider = React43.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs31(
  SliderPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx52(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsx52(SliderPrimitive.Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsx52(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;

// src/components/ui/sonner.tsx
import { useTheme as useTheme2 } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { jsx as jsx53 } from "react/jsx-runtime";
var Toaster = /* @__PURE__ */ __name(({ ...props }) => {
  const { theme = "system" } = useTheme2();
  return /* @__PURE__ */ jsx53(
    Sonner,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
}, "Toaster");

// src/components/ui/switch.tsx
import * as React44 from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { jsx as jsx54 } from "react/jsx-runtime";
var Switch = React44.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx54(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx54(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;

// src/components/ui/table.tsx
import * as React45 from "react";
import { jsx as jsx55 } from "react/jsx-runtime";
var Table = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx55(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
var TableHeader = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
var TableBody = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
var TableFooter = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "tfoot",
  {
    ref,
    className: cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
var TableRow = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "tr",
  {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
var TableHead = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
var TableCell = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
var TableCaption = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx55(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-muted-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";

// src/components/ui/tabs.tsx
import * as React46 from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { jsx as jsx56 } from "react/jsx-runtime";
var Tabs = TabsPrimitive.Root;
var TabsList = React46.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx56(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React46.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx56(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React46.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx56(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// src/components/ui/textarea.tsx
import * as React47 from "react";
import { jsx as jsx57 } from "react/jsx-runtime";
var Textarea = React47.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx57(
    "textarea",
    {
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

// src/components/ui/toggle-group.tsx
import * as React49 from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

// src/components/ui/toggle.tsx
import * as React48 from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva as cva8 } from "class-variance-authority";
import { jsx as jsx58 } from "react/jsx-runtime";
var toggleVariants = cva8(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Toggle = React48.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx58(
  TogglePrimitive.Root,
  {
    ref,
    className: cn(toggleVariants({ variant, size, className })),
    ...props
  }
));
Toggle.displayName = TogglePrimitive.Root.displayName;

// src/components/ui/toggle-group.tsx
import { jsx as jsx59 } from "react/jsx-runtime";
var ToggleGroupContext = React49.createContext({
  size: "default",
  variant: "default"
});
var ToggleGroup = React49.forwardRef(({ className, variant, size, children, ...props }, ref) => /* @__PURE__ */ jsx59(
  ToggleGroupPrimitive.Root,
  {
    ref,
    className: cn("flex items-center justify-center gap-1", className),
    ...props,
    children: /* @__PURE__ */ jsx59(ToggleGroupContext.Provider, { value: { variant, size }, children })
  }
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
var ToggleGroupItem = React49.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = React49.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsx59(
    ToggleGroupPrimitive.Item,
    {
      ref,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size
        }),
        className
      ),
      ...props,
      children
    }
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

// src/components/ApplicationLauncher.tsx
import { DynamicIcon as DynamicIcon4 } from "lucide-react/dynamic";
import { Grid3X3 as Grid3X33, Star as Star3, Search as Search4 } from "lucide-react";
import { Fragment as Fragment4, jsx as jsx60, jsxs as jsxs32 } from "react/jsx-runtime";
var APP_CATEGORY_LABELS = {
  core: "Core Services",
  analytics: "Analytics",
  communication: "Communication",
  storage: "Storage",
  compute: "Compute",
  database: "Database",
  security: "Security",
  monitoring: "Monitoring",
  networking: "Networking",
  ai_ml: "AI/ML",
  development: "Development",
  other: "Other"
};
function NavItem({
  label,
  icon,
  isActive,
  count,
  onClick,
  type = "default"
}) {
  return /* @__PURE__ */ jsxs32(Fragment4, { children: [
    /* @__PURE__ */ jsxs32(
      "button",
      {
        onClick,
        className: cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
          isActive ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        ),
        children: [
          /* @__PURE__ */ jsxs32("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx60(DynamicIcon4, { name: icon, className: "h-4 w-4" }),
            /* @__PURE__ */ jsx60("span", { children: label })
          ] }),
          count !== void 0 && /* @__PURE__ */ jsx60(Badge, { variant: "secondary", className: "text-xs", children: count })
        ]
      }
    ),
    type === "divider-after" && /* @__PURE__ */ jsx60("div", { className: "border-t border-gray-200 dark:border-gray-700 my-2" })
  ] });
}
__name(NavItem, "NavItem");
function CompactAppCard({
  app,
  isFavorite,
  onToggleFavorite,
  onAppClick
}) {
  return /* @__PURE__ */ jsxs32(
    "div",
    {
      className: "group relative flex items-center space-x-2 p-1.5 hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md border border-transparent hover:border-border/50",
      onClick: () => onAppClick(app),
      children: [
        /* @__PURE__ */ jsxs32("div", { className: "relative", children: [
          /* @__PURE__ */ jsx60("div", { className: "w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-border group-hover:border-blue-500/30 transition-all duration-200", children: /* @__PURE__ */ jsx60(
            DynamicIcon4,
            {
              name: app.icon || "package",
              className: "h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors"
            }
          ) }),
          isFavorite && /* @__PURE__ */ jsx60("div", { className: "absolute -top-0.5 -right-0.5 flex items-center justify-center", children: /* @__PURE__ */ jsx60(Star3, { className: "h-3 w-3 text-yellow-500 fill-yellow-500 drop-shadow-sm" }) })
        ] }),
        /* @__PURE__ */ jsx60("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxs32("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs32("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx60("h4", { className: "font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate", children: app.name }),
            /* @__PURE__ */ jsx60("p", { className: "text-xs text-muted-foreground line-clamp-1 mt-0", children: app.description || "Application description not available" }),
            /* @__PURE__ */ jsx60("div", { className: "flex items-center mt-0.5", children: /* @__PURE__ */ jsx60(Badge, { variant: "secondary", className: "text-xs px-1.5 py-0", children: app.category && APP_CATEGORY_LABELS[app.category] || (app.category ? app.category.charAt(0).toUpperCase() + app.category.slice(1) : "Other") }) })
          ] }),
          /* @__PURE__ */ jsx60(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: (e) => {
                e.stopPropagation();
                onToggleFavorite(app.id);
              },
              className: `ml-1 h-6 w-6 p-0 transition-all duration-200 self-start ${isFavorite ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "text-muted-foreground hover:text-yellow-500 hover:bg-accent"}`,
              children: /* @__PURE__ */ jsx60(
                Star3,
                {
                  className: `h-3.5 w-3.5 transition-all duration-200 ${isFavorite ? "fill-current" : ""}`
                }
              )
            }
          )
        ] }) })
      ]
    }
  );
}
__name(CompactAppCard, "CompactAppCard");
function AWSAppCard({
  app,
  isFavorite,
  onToggleFavorite,
  onAppClick
}) {
  return /* @__PURE__ */ jsx60(
    "div",
    {
      className: "group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800",
      onClick: () => onAppClick(app),
      children: /* @__PURE__ */ jsxs32("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx60("div", { className: "w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-gray-200 dark:border-gray-600 flex-shrink-0", children: /* @__PURE__ */ jsx60(
          DynamicIcon4,
          {
            name: app.icon || "package",
            className: "h-6 w-6 text-blue-600"
          }
        ) }),
        /* @__PURE__ */ jsxs32("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs32("div", { className: "flex items-start justify-between mb-1", children: [
            /* @__PURE__ */ jsx60("h3", { className: "font-semibold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 truncate pr-2", children: app.name }),
            /* @__PURE__ */ jsx60(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: (e) => {
                  e.stopPropagation();
                  onToggleFavorite(app.id);
                },
                className: cn(
                  "h-6 w-6 p-0 flex-shrink-0",
                  isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"
                ),
                children: /* @__PURE__ */ jsx60(Star3, { className: cn("h-4 w-4", isFavorite && "fill-current") })
              }
            )
          ] }),
          /* @__PURE__ */ jsx60("p", { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2", children: app.description || "No description available" }),
          /* @__PURE__ */ jsx60(Badge, { variant: "secondary", className: "text-xs", children: APP_CATEGORY_LABELS[app.category] || "Other" })
        ] })
      ] })
    }
  );
}
__name(AWSAppCard, "AWSAppCard");
function ApplicationLauncher2({
  className,
  session,
  variant = "compact"
}) {
  const router = useRouter4();
  const searchParams = useSearchParams();
  const { favoriteApps: favorites, toggleFavorite } = useFavorites();
  const [isOpen, setIsOpen] = useState8(false);
  const [apps, setApps] = useState8([]);
  const [loading, setLoading] = useState8(false);
  const [searchQuery, setSearchQuery] = useState8("");
  const [activeFilter, setActiveFilter] = useState8("all-applications");
  useEffect16(() => {
    const fetchApps = /* @__PURE__ */ __name(async () => {
      if (!session?.user) return;
      setLoading(true);
      try {
        const result = await apiClient.run({
          service: "application",
          operation: "listApplications"
        });
        if (result.success && result.data) {
          setApps(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    }, "fetchApps");
    if (isOpen) {
      fetchApps();
    }
  }, [isOpen, session]);
  const handleToggleFavorite = useCallback9((appId) => {
    toggleFavorite(appId);
  }, [toggleFavorite]);
  const handleAppClick = useCallback9((app) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("app", app.slug);
    router.push(`/?${newParams.toString()}`);
    setIsOpen(false);
  }, [router, searchParams]);
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "favorites") {
      return favorites.includes(app.id);
    } else if (activeFilter === "all-applications" || activeFilter === "all-services") {
      return true;
    } else {
      return app.category === activeFilter;
    }
  });
  const getCategoryCount = /* @__PURE__ */ __name((category) => {
    return apps.filter((app) => app.category === category).length;
  }, "getCategoryCount");
  const renderCompactView = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsx60(
    SheetContent,
    {
      side: "left",
      className: "w-[400px] sm:w-[450px] p-0 overflow-hidden",
      children: /* @__PURE__ */ jsxs32("div", { className: "flex flex-col h-full", children: [
        /* @__PURE__ */ jsxs32(SheetHeader, { className: "px-4 pt-4 pb-3 border-b", children: [
          /* @__PURE__ */ jsx60(SheetTitle, { className: "text-base", children: "Application Launcher" }),
          /* @__PURE__ */ jsxs32("div", { className: "relative mt-2", children: [
            /* @__PURE__ */ jsx60(
              Input,
              {
                type: "text",
                placeholder: "Search applications...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-8 h-8 text-sm"
              }
            ),
            /* @__PURE__ */ jsx60(Search4, { className: "absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" })
          ] })
        ] }),
        /* @__PURE__ */ jsx60(ScrollArea, { className: "flex-1 px-2 py-2", children: /* @__PURE__ */ jsx60("div", { className: "space-y-0.5", children: loading ? /* @__PURE__ */ jsx60("div", { className: "text-center py-4 text-sm text-muted-foreground", children: "Loading applications..." }) : filteredApps.length === 0 ? /* @__PURE__ */ jsx60("div", { className: "text-center py-4 text-sm text-muted-foreground", children: "No applications found" }) : filteredApps.map((app) => /* @__PURE__ */ jsx60(
          CompactAppCard,
          {
            app,
            isFavorite: favorites.includes(app.id),
            onToggleFavorite: handleToggleFavorite,
            onAppClick: handleAppClick
          },
          app.id
        )) }) })
      ] })
    }
  ), "renderCompactView");
  const renderAWSView = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsx60(
    SheetContent,
    {
      side: "left",
      className: "w-full sm:max-w-4xl p-0 overflow-hidden",
      children: /* @__PURE__ */ jsxs32("div", { className: "flex h-full", children: [
        /* @__PURE__ */ jsxs32("div", { className: "w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50", children: [
          /* @__PURE__ */ jsx60(SheetHeader, { className: "px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx60(SheetTitle, { className: "text-lg font-semibold", children: "Services" }) }),
          /* @__PURE__ */ jsx60(ScrollArea, { className: "h-[calc(100vh-5rem)]", children: /* @__PURE__ */ jsxs32("div", { className: "p-3 space-y-1", children: [
            /* @__PURE__ */ jsx60(
              NavItem,
              {
                label: "Favorites",
                icon: "star",
                isActive: activeFilter === "favorites",
                count: favorites.length,
                onClick: () => setActiveFilter("favorites"),
                type: "divider-after"
              }
            ),
            /* @__PURE__ */ jsx60(
              NavItem,
              {
                label: "All Applications",
                icon: "grid-3x3",
                isActive: activeFilter === "all-applications",
                count: apps.length,
                onClick: () => setActiveFilter("all-applications")
              }
            ),
            /* @__PURE__ */ jsx60(
              NavItem,
              {
                label: "All Services",
                icon: "layers",
                isActive: activeFilter === "all-services",
                count: apps.length,
                onClick: () => setActiveFilter("all-services"),
                type: "divider-after"
              }
            ),
            Object.entries(APP_CATEGORY_LABELS).map(([key, label]) => /* @__PURE__ */ jsx60(
              NavItem,
              {
                label,
                icon: getCategoryIcon(key),
                isActive: activeFilter === key,
                count: getCategoryCount(key),
                onClick: () => setActiveFilter(key)
              },
              key
            ))
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs32("div", { className: "flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsxs32("div", { className: "px-6 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxs32("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxs32("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: [
                activeFilter === "favorites" && "Favorites",
                activeFilter === "all-applications" && "All Applications",
                activeFilter === "all-services" && "All Services",
                APP_CATEGORY_LABELS[activeFilter]
              ] }),
              /* @__PURE__ */ jsxs32(Badge, { variant: "secondary", children: [
                filteredApps.length,
                " ",
                filteredApps.length === 1 ? "item" : "items"
              ] })
            ] }),
            /* @__PURE__ */ jsxs32("div", { className: "relative", children: [
              /* @__PURE__ */ jsx60(
                Input,
                {
                  type: "text",
                  placeholder: "Search...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "pl-9"
                }
              ),
              /* @__PURE__ */ jsx60(Search4, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" })
            ] })
          ] }),
          /* @__PURE__ */ jsx60(ScrollArea, { className: "flex-1 p-6", children: loading ? /* @__PURE__ */ jsx60("div", { className: "text-center py-8 text-gray-500", children: "Loading applications..." }) : filteredApps.length === 0 ? /* @__PURE__ */ jsx60("div", { className: "text-center py-8 text-gray-500", children: searchQuery ? `No results found for "${searchQuery}"` : "No applications in this category" }) : /* @__PURE__ */ jsx60("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredApps.map((app) => /* @__PURE__ */ jsx60(
            AWSAppCard,
            {
              app,
              isFavorite: favorites.includes(app.id),
              onToggleFavorite: handleToggleFavorite,
              onAppClick: handleAppClick
            },
            app.id
          )) }) })
        ] })
      ] })
    }
  ), "renderAWSView");
  return /* @__PURE__ */ jsxs32(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx60(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs32(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: cn("flex items-center gap-2", className),
        children: [
          /* @__PURE__ */ jsx60(Grid3X33, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx60("span", { children: "Applications" })
        ]
      }
    ) }),
    variant === "aws" ? renderAWSView() : renderCompactView()
  ] });
}
__name(ApplicationLauncher2, "ApplicationLauncher");
function getCategoryIcon(category) {
  const iconMap2 = {
    core: "cpu",
    analytics: "bar-chart",
    communication: "message-circle",
    storage: "hard-drive",
    compute: "server",
    database: "database",
    security: "shield",
    monitoring: "activity",
    networking: "network",
    ai_ml: "brain",
    development: "code",
    other: "package"
  };
  return iconMap2[category] || "package";
}
__name(getCategoryIcon, "getCategoryIcon");

// src/components/UserRegistrationForm.tsx
import { useState as useState9, useEffect as useEffect17 } from "react";
import { Loader2 as Loader23, UserPlus, AlertCircle as AlertCircle2, Building, LogOut as LogOut2 } from "lucide-react";
import { signOut as signOut3 } from "next-auth/react";
import { Fragment as Fragment5, jsx as jsx61, jsxs as jsxs33 } from "react/jsx-runtime";
function UserRegistrationForm({
  onRegistrationComplete,
  captifyStatus,
  userId
}) {
  const [loading, setLoading] = useState9(false);
  const [tenants, setTenants] = useState9([]);
  const [loadingTenants, setLoadingTenants] = useState9(true);
  const [isLocked, setIsLocked] = useState9(captifyStatus === "registered");
  const [loadingUser, setLoadingUser] = useState9(false);
  const [currentStatus, setCurrentStatus] = useState9(captifyStatus);
  const [formData, setFormData] = useState9({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    department: "",
    phone: "",
    tenantId: ""
  });
  const [registrationMessage, setRegistrationMessage] = useState9(
    null
  );
  const [error, setError] = useState9(null);
  const [emailError, setEmailError] = useState9(null);
  useEffect17(() => {
    const fetchUserData = /* @__PURE__ */ __name(async () => {
      if (!userId) {
        return;
      }
      setLoadingUser(true);
      try {
        const result = await apiClient.run({
          service: "dynamo",
          operation: "get",
          app: "core",
          table: "User",
          data: {
            Key: {
              id: userId
            }
          }
        });
        if (result.success && result.data) {
          setFormData({
            firstName: result.data.profile?.firstName || "",
            lastName: result.data.profile?.lastName || "",
            email: result.data.email || "",
            title: result.data.profile?.title || "",
            department: result.data.profile?.department || "",
            phone: result.data.profile?.phone || "",
            tenantId: result.data.tenantId || ""
          });
          if (result.data.status === "registered") {
            setIsLocked(true);
            setCurrentStatus("registered");
            setRegistrationMessage(
              "Your registration has been submitted and is pending approval from an administrator."
            );
          } else if (result.data.status === "unregistered") {
            setIsLocked(false);
            setCurrentStatus("unregistered");
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoadingUser(false);
      }
    }, "fetchUserData");
    fetchUserData();
  }, [userId]);
  useEffect17(() => {
    const fetchTenants = /* @__PURE__ */ __name(async () => {
      try {
        const result = await apiClient.run({
          service: "dynamo",
          operation: "scan",
          app: "core",
          table: "Tenant",
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
        if (result.success && result.data?.Items) {
          setTenants(result.data.Items);
        }
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
      } finally {
        setLoadingTenants(false);
      }
    }, "fetchTenants");
    fetchTenants();
  }, []);
  const handleSubmit = /* @__PURE__ */ __name(async (e) => {
    e.preventDefault();
    if (isLocked && currentStatus === "registered") {
      try {
        const result = await apiClient.run({
          service: "user",
          operation: "updateOwnStatus",
          data: {
            status: "unregistered"
          }
        });
        if (result.success) {
          setIsLocked(false);
          setCurrentStatus("unregistered");
          setRegistrationMessage("You can now edit your registration.");
        } else {
          setError("Failed to unlock form");
        }
      } catch (err) {
        console.error("Failed to update status to unregistered:", err);
        setError("Failed to unlock form");
      }
      return;
    }
    setRegistrationMessage(null);
    setError(null);
    setLoading(true);
    try {
      console.log("Saving profile data:", formData);
      const profileResult = await apiClient.run({
        service: "dynamo",
        operation: "update",
        app: "core",
        table: "User",
        data: {
          Key: {
            id: userId
          },
          UpdateExpression: "SET #profile = :profile, #email = :email, #tenantId = :tenantId, #updatedAt = :updatedAt",
          ExpressionAttributeNames: {
            "#profile": "profile",
            "#email": "email",
            "#tenantId": "tenantId",
            "#updatedAt": "updatedAt"
          },
          ExpressionAttributeValues: {
            ":profile": {
              firstName: formData.firstName,
              lastName: formData.lastName,
              title: formData.title,
              department: formData.department,
              phone: formData.phone
            },
            ":email": formData.email,
            ":tenantId": formData.tenantId || null,
            ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      console.log("Profile update result:", profileResult);
      if (profileResult.success) {
        const statusResult = await apiClient.run({
          service: "dynamo",
          operation: "update",
          app: "core",
          table: "User",
          data: {
            Key: {
              id: userId
            },
            UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
              "#status": "status",
              "#updatedAt": "updatedAt"
            },
            ExpressionAttributeValues: {
              ":status": "registered",
              ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
            }
          }
        });
        console.log("Status update result:", statusResult);
        if (statusResult.success) {
          setRegistrationMessage(
            "Registration complete! Your account is pending approval from an administrator."
          );
          setIsLocked(true);
          setCurrentStatus("registered");
          if (onRegistrationComplete) {
            setTimeout(() => {
              onRegistrationComplete();
            }, 2e3);
          }
        } else {
          setError("Failed to update registration status");
        }
      } else {
        setError(profileResult.error || "Failed to save profile information");
      }
    } catch (err) {
      setError("Failed to complete registration");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  }, "handleSubmit");
  const formatPhoneNumber = /* @__PURE__ */ __name((value) => {
    const phoneNumber = value.replace(/\D/g, "");
    const limitedNumber = phoneNumber.slice(0, 10);
    if (limitedNumber.length === 0) {
      return "";
    } else if (limitedNumber.length <= 3) {
      return `(${limitedNumber}`;
    } else if (limitedNumber.length <= 6) {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    } else {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
    }
  }, "formatPhoneNumber");
  const validateEmail = /* @__PURE__ */ __name((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, "validateEmail");
  const handleInputChange = /* @__PURE__ */ __name((e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  }, "handleInputChange");
  return /* @__PURE__ */ jsxs33(Card, { className: "w-full max-w-2xl mx-auto relative", children: [
    /* @__PURE__ */ jsxs33(
      Button,
      {
        onClick: () => signOut3(),
        size: "sm",
        className: "absolute top-4 right-4 bg-black text-white hover:bg-gray-800",
        children: [
          /* @__PURE__ */ jsx61(LogOut2, { className: "h-4 w-4 mr-2" }),
          "Sign Out"
        ]
      }
    ),
    /* @__PURE__ */ jsxs33(CardHeader, { children: [
      /* @__PURE__ */ jsxs33(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx61(UserPlus, { className: "h-5 w-5" }),
        currentStatus === "registered" ? "Update Your Registration" : "Complete Your Registration"
      ] }),
      /* @__PURE__ */ jsx61(CardDescription, { children: currentStatus === "registered" ? "Your registration is pending approval. You can unlock and update your profile, but this may reset your position in the approval queue." : "Please provide your information to complete the registration process. Your account will require administrator approval before you can access the system." })
    ] }),
    /* @__PURE__ */ jsx61(CardContent, { children: /* @__PURE__ */ jsxs33("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx61(Label3, { htmlFor: "email", children: "Email *" }),
        /* @__PURE__ */ jsx61(
          Input,
          {
            id: "email",
            name: "email",
            type: "email",
            value: formData.email,
            onChange: handleInputChange,
            required: true,
            disabled: isLocked,
            placeholder: "john.doe@example.com",
            className: emailError ? "border-red-500" : ""
          }
        ),
        emailError && /* @__PURE__ */ jsx61("p", { className: "text-sm text-red-500", children: emailError })
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx61(Label3, { htmlFor: "firstName", children: "First Name *" }),
          /* @__PURE__ */ jsx61(
            Input,
            {
              id: "firstName",
              name: "firstName",
              value: formData.firstName,
              onChange: handleInputChange,
              required: true,
              disabled: isLocked,
              placeholder: "John"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx61(Label3, { htmlFor: "lastName", children: "Last Name *" }),
          /* @__PURE__ */ jsx61(
            Input,
            {
              id: "lastName",
              name: "lastName",
              value: formData.lastName,
              onChange: handleInputChange,
              required: true,
              disabled: isLocked,
              placeholder: "Doe"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx61(Label3, { htmlFor: "title", children: "Job Title" }),
          /* @__PURE__ */ jsx61(
            Input,
            {
              id: "title",
              name: "title",
              value: formData.title,
              onChange: handleInputChange,
              disabled: isLocked,
              placeholder: "Software Engineer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx61(Label3, { htmlFor: "department", children: "Department" }),
          /* @__PURE__ */ jsx61(
            Input,
            {
              id: "department",
              name: "department",
              value: formData.department,
              onChange: handleInputChange,
              disabled: isLocked,
              placeholder: "Engineering"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx61(Label3, { htmlFor: "phone", children: "Phone Number (US)" }),
        /* @__PURE__ */ jsx61(
          Input,
          {
            id: "phone",
            name: "phone",
            value: formData.phone,
            onChange: handleInputChange,
            disabled: isLocked,
            placeholder: "(555) 123-4567",
            type: "tel",
            maxLength: 14
          }
        )
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs33(Label3, { htmlFor: "tenantId", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx61(Building, { className: "h-4 w-4" }),
          "Organization (Optional)"
        ] }),
        loadingTenants ? /* @__PURE__ */ jsxs33("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx61(Loader23, { className: "h-4 w-4 animate-spin" }),
          "Loading organizations..."
        ] }) : /* @__PURE__ */ jsxs33(
          Select,
          {
            value: formData.tenantId,
            onValueChange: (value) => setFormData((prev) => ({ ...prev, tenantId: value })),
            disabled: isLocked,
            children: [
              /* @__PURE__ */ jsx61(SelectTrigger, { children: /* @__PURE__ */ jsx61(SelectValue, { placeholder: "Select your organization (optional)" }) }),
              /* @__PURE__ */ jsx61(SelectContent, { children: tenants.length > 0 ? tenants.map((tenant) => /* @__PURE__ */ jsxs33(SelectItem, { value: tenant.id, children: [
                tenant.name,
                " (",
                tenant.code,
                ")"
              ] }, tenant.id)) : /* @__PURE__ */ jsx61(SelectItem, { value: "none", disabled: true, children: "No organizations available" }) })
            ]
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxs33(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsx61(AlertCircle2, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx61(AlertDescription, { children: error })
      ] }),
      registrationMessage && /* @__PURE__ */ jsxs33(Alert, { className: "bg-green-50 border-green-200 text-green-800", children: [
        /* @__PURE__ */ jsx61(AlertCircle2, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx61(AlertDescription, { children: registrationMessage })
      ] }),
      /* @__PURE__ */ jsx61(Button, { type: "submit", className: "w-full", disabled: loading || !!emailError, children: loading ? /* @__PURE__ */ jsxs33(Fragment5, { children: [
        /* @__PURE__ */ jsx61(Loader23, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Registering..."
      ] }) : isLocked && currentStatus === "registered" ? /* @__PURE__ */ jsxs33(Fragment5, { children: [
        /* @__PURE__ */ jsx61(UserPlus, { className: "mr-2 h-4 w-4" }),
        "Unlock Registration"
      ] }) : /* @__PURE__ */ jsxs33(Fragment5, { children: [
        /* @__PURE__ */ jsx61(UserPlus, { className: "mr-2 h-4 w-4" }),
        "Complete Registration"
      ] }) })
    ] }) })
  ] });
}
__name(UserRegistrationForm, "UserRegistrationForm");
export {
  APP_CATEGORY_LABELS,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  ApplicationLauncher2 as ApplicationLauncher,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Calendar,
  CaptifyProvider,
  CaptifyProviders,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  ClientOnly,
  Collapsible,
  CollapsibleContent2 as CollapsibleContent,
  CollapsibleTrigger2 as CollapsibleTrigger,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DynamicIcon3 as DynamicIcon,
  FavoritesBar,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  GlobalSearch,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label3 as Label,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  PackageAgentPanel,
  PackageContentPanel,
  PackagePageRouter,
  PackageRenderer,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup4 as RadioGroup,
  RadioGroupItem,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  ScrollBar,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator2 as Separator,
  ServerCaptifyProvider,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SignInForm,
  Skeleton,
  Slider,
  SmartBreadcrumb,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ThemeToggle,
  ThreePanelLayout,
  Toaster,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TopNavigation,
  UserRegistrationForm,
  badgeVariants,
  buttonVariants,
  loadPackageRegistry,
  navigationMenuTriggerStyle,
  toggleVariants,
  useCaptify,
  useFormField,
  useSidebar
};
//# sourceMappingURL=components.mjs.map