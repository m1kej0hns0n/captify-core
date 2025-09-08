"use client";
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/components/ui/accordion.tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
__name(cn, "cn");
var ApiClient = class {
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
var apiClient = new ApiClient();

// src/components/ui/accordion.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// src/components/ui/alert-dialog.tsx
import * as React4 from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// src/components/ui/button.tsx
import * as React3 from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// src/lib/api.ts
var ApiClient2 = class {
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
var apiClient2 = new ApiClient2();

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
var useState = useSafeState;

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

// src/components/ui/button.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
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
var Button = React3.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx2(
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

// src/components/ui/alert-dialog.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogPortal = AlertDialogPrimitive.Portal;
var AlertDialogOverlay = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
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
var AlertDialogContent = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs2(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx3(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx3(
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
}) => /* @__PURE__ */ jsx3(
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
}) => /* @__PURE__ */ jsx3(
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
var AlertDialogTitle = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
var AlertDialogDescription = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
var AlertDialogAction = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
var AlertDialogCancel = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
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
import * as React5 from "react";
import { cva as cva2 } from "class-variance-authority";
import { jsx as jsx4 } from "react/jsx-runtime";
var alertVariants = cva2(
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
var Alert = React5.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx4(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
var AlertTitle = React5.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx4(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React5.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx4(
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

// src/components/ui/avatar.tsx
import * as React6 from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { jsx as jsx5 } from "react/jsx-runtime";
var Avatar = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
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
var AvatarImage = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
var AvatarFallback = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
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

// src/components/ui/badge.tsx
import { cva as cva3 } from "class-variance-authority";
import { jsx as jsx6 } from "react/jsx-runtime";
var badgeVariants = cva3(
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
  return /* @__PURE__ */ jsx6("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
__name(Badge, "Badge");

// src/components/ui/breadcrumb.tsx
import * as React7 from "react";
import { Slot as Slot2 } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
var Breadcrumb = React7.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx7("nav", { ref, "aria-label": "breadcrumb", ...props }));
Breadcrumb.displayName = "Breadcrumb";
var BreadcrumbList = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
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
var BreadcrumbItem = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  "li",
  {
    ref,
    className: cn("inline-flex items-center gap-1.5", className),
    ...props
  }
));
BreadcrumbItem.displayName = "BreadcrumbItem";
var BreadcrumbLink = React7.forwardRef(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot2 : "a";
  return /* @__PURE__ */ jsx7(
    Comp,
    {
      ref,
      className: cn("transition-colors hover:text-foreground", className),
      ...props
    }
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";
var BreadcrumbPage = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
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
}) => /* @__PURE__ */ jsx7(
  "li",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className),
    ...props,
    children: children ?? /* @__PURE__ */ jsx7(ChevronRight, {})
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
      /* @__PURE__ */ jsx7(MoreHorizontal, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx7("span", { className: "sr-only", children: "More" })
    ]
  }
), "BreadcrumbEllipsis");
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

// src/components/ui/calendar.tsx
import { useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { jsx as jsx8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx8(
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
          return /* @__PURE__ */ jsx8(
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
            return /* @__PURE__ */ jsx8(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx8(
              ChevronRightIcon,
              {
                className: cn("size-4", className2),
                ...props2
              }
            );
          }
          return /* @__PURE__ */ jsx8(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        }, "Chevron"),
        DayButton: CalendarDayButton,
        WeekNumber: /* @__PURE__ */ __name(({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx8("td", { ...props2, children: /* @__PURE__ */ jsx8("div", { className: "flex size-[--cell-size] items-center justify-center text-center", children }) });
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
  const ref = useRef(null);
  useEffect(() => {
    if (typeof window !== "undefined" && modifiers.focused && ref.current) {
      ref.current.focus();
    }
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx8(
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
import * as React8 from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var Card = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9(
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
var CardHeader = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx9(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/ui/carousel.tsx
import * as React9 from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { jsx as jsx10, jsxs as jsxs4 } from "react/jsx-runtime";
var CarouselContext = React9.createContext(null);
function useCarousel() {
  const context = React9.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
__name(useCarousel, "useCarousel");
var Carousel = React9.forwardRef(
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
    const onSelect = React9.useCallback((api2) => {
      if (!api2) {
        return;
      }
      setCanScrollPrev(api2.canScrollPrev());
      setCanScrollNext(api2.canScrollNext());
    }, []);
    const scrollPrev = React9.useCallback(() => {
      api?.scrollPrev();
    }, [api]);
    const scrollNext = React9.useCallback(() => {
      api?.scrollNext();
    }, [api]);
    const handleKeyDown = React9.useCallback(
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
    React9.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);
    React9.useEffect(() => {
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
    return /* @__PURE__ */ jsx10(
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
        children: /* @__PURE__ */ jsx10(
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
var CarouselContent = React9.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsx10("div", { ref: carouselRef, className: "overflow-hidden", children: /* @__PURE__ */ jsx10(
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
var CarouselItem = React9.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsx10(
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
var CarouselPrevious = React9.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxs4(
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
        /* @__PURE__ */ jsx10(ArrowLeft, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx10("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
});
CarouselPrevious.displayName = "CarouselPrevious";
var CarouselNext = React9.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxs4(
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
        /* @__PURE__ */ jsx10(ArrowRight, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx10("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
});
CarouselNext.displayName = "CarouselNext";

// src/components/ui/chart.tsx
import * as React10 from "react";
import * as RechartsPrimitive from "recharts";
import { Fragment, jsx as jsx11, jsxs as jsxs5 } from "react/jsx-runtime";
var THEMES = { light: "", dark: ".dark" };
var ChartContext = React10.createContext(null);
function useChart() {
  const context = React10.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
__name(useChart, "useChart");
var ChartContainer = React10.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React10.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsx11(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxs5(
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
        /* @__PURE__ */ jsx11(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsx11(RechartsPrimitive.ResponsiveContainer, { children })
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
  return /* @__PURE__ */ jsx11(
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
var ChartTooltipContent = React10.forwardRef(
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
    const tooltipLabel = React10.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
      if (labelFormatter) {
        return /* @__PURE__ */ jsx11("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
      }
      if (!value) {
        return null;
      }
      return /* @__PURE__ */ jsx11("div", { className: cn("font-medium", labelClassName), children: value });
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
    return /* @__PURE__ */ jsxs5(
      "div",
      {
        ref,
        className: cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        ),
        children: [
          !nestLabel ? tooltipLabel : null,
          /* @__PURE__ */ jsx11("div", { className: "grid gap-1.5", children: payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;
            return /* @__PURE__ */ jsx11(
              "div",
              {
                className: cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                ),
                children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxs5(Fragment, { children: [
                  itemConfig?.icon ? /* @__PURE__ */ jsx11(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsx11(
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
                  /* @__PURE__ */ jsxs5(
                    "div",
                    {
                      className: cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      ),
                      children: [
                        /* @__PURE__ */ jsxs5("div", { className: "grid gap-1.5", children: [
                          nestLabel ? tooltipLabel : null,
                          /* @__PURE__ */ jsx11("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                        ] }),
                        item.value && /* @__PURE__ */ jsx11("span", { className: "font-mono font-medium tabular-nums text-foreground", children: item.value.toLocaleString() })
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
var ChartLegendContent = React10.forwardRef(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart();
    if (!payload?.length) {
      return null;
    }
    return /* @__PURE__ */ jsx11(
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
          return /* @__PURE__ */ jsxs5(
            "div",
            {
              className: cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              ),
              children: [
                itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsx11(itemConfig.icon, {}) : /* @__PURE__ */ jsx11(
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
import * as React11 from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { jsx as jsx12 } from "react/jsx-runtime";
var Checkbox = React11.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx12(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx12(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsx12(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/components/ui/collapsible.tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
var Collapsible = CollapsiblePrimitive.Root;
var CollapsibleTrigger2 = CollapsiblePrimitive.CollapsibleTrigger;
var CollapsibleContent2 = CollapsiblePrimitive.CollapsibleContent;

// src/components/ui/command.tsx
import * as React13 from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

// src/components/ui/dialog.tsx
import * as React12 from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogClose = DialogPrimitive.Close;
var DialogOverlay = React12.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx13(
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
var DialogContent = React12.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs6(DialogPortal, { children: [
  /* @__PURE__ */ jsx13(DialogOverlay, {}),
  /* @__PURE__ */ jsxs6(
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
        /* @__PURE__ */ jsxs6(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx13(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx13("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx13(
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
}) => /* @__PURE__ */ jsx13(
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
var DialogTitle = React12.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx13(
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
var DialogDescription = React12.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx13(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// src/components/ui/command.tsx
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
var Command = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx14(
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
  return /* @__PURE__ */ jsx14(Dialog, { ...props, children: /* @__PURE__ */ jsx14(DialogContent, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsx14(Command, { className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children }) }) });
}, "CommandDialog");
var CommandInput = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs7("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsx14(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsx14(
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
var CommandList = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx14(
  CommandPrimitive.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = CommandPrimitive.List.displayName;
var CommandEmpty = React13.forwardRef((props, ref) => /* @__PURE__ */ jsx14(
  CommandPrimitive.Empty,
  {
    ref,
    className: "py-6 text-center text-sm",
    ...props
  }
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
var CommandGroup = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx14(
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
var CommandSeparator = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx14(
  CommandPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
var CommandItem = React13.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx14(
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
  return /* @__PURE__ */ jsx14(
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
import * as React14 from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check as Check2, ChevronRight as ChevronRight2, Circle } from "lucide-react";
import { jsx as jsx15, jsxs as jsxs8 } from "react/jsx-runtime";
var ContextMenu = ContextMenuPrimitive.Root;
var ContextMenuTrigger = ContextMenuPrimitive.Trigger;
var ContextMenuGroup = ContextMenuPrimitive.Group;
var ContextMenuPortal = ContextMenuPrimitive.Portal;
var ContextMenuSub = ContextMenuPrimitive.Sub;
var ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
var ContextMenuSubTrigger = React14.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs8(
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
      /* @__PURE__ */ jsx15(ChevronRight2, { className: "ml-auto h-4 w-4" })
    ]
  }
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;
var ContextMenuSubContent = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx15(
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
var ContextMenuContent = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx15(ContextMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx15(
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
var ContextMenuItem = React14.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx15(
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
var ContextMenuCheckboxItem = React14.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs8(
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
      /* @__PURE__ */ jsx15("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx15(ContextMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx15(Check2, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;
var ContextMenuRadioItem = React14.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs8(
  ContextMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx15("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx15(ContextMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx15(Circle, { className: "h-4 w-4 fill-current" }) }) }),
      children
    ]
  }
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;
var ContextMenuLabel = React14.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx15(
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
var ContextMenuSeparator = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx15(
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
  return /* @__PURE__ */ jsx15(
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
import * as React15 from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { jsx as jsx16, jsxs as jsxs9 } from "react/jsx-runtime";
var Drawer = /* @__PURE__ */ __name(({
  shouldScaleBackground = true,
  ...props
}) => /* @__PURE__ */ jsx16(
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
var DrawerOverlay = React15.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx16(
  DrawerPrimitive.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props
  }
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;
var DrawerContent = React15.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs9(DrawerPortal, { children: [
  /* @__PURE__ */ jsx16(DrawerOverlay, {}),
  /* @__PURE__ */ jsxs9(
    DrawerPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx16("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }),
        children
      ]
    }
  )
] }));
DrawerContent.displayName = "DrawerContent";
var DrawerHeader = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx16(
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
}) => /* @__PURE__ */ jsx16(
  "div",
  {
    className: cn("mt-auto flex flex-col gap-2 p-4", className),
    ...props
  }
), "DrawerFooter");
DrawerFooter.displayName = "DrawerFooter";
var DrawerTitle = React15.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx16(
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
var DrawerDescription = React15.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx16(
  DrawerPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

// src/components/ui/dropdown-menu.tsx
import * as React16 from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check as Check3, ChevronRight as ChevronRight3, Circle as Circle2 } from "lucide-react";
import { jsx as jsx17, jsxs as jsxs10 } from "react/jsx-runtime";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuPortal = DropdownMenuPrimitive.Portal;
var DropdownMenuSub = DropdownMenuPrimitive.Sub;
var DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
var DropdownMenuSubTrigger = React16.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs10(
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
      /* @__PURE__ */ jsx17(ChevronRight3, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = React16.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx17(
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
var DropdownMenuContent = React16.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx17(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx17(
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
var DropdownMenuItem = React16.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx17(
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
var DropdownMenuCheckboxItem = React16.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs10(
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
      /* @__PURE__ */ jsx17("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx17(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx17(Check3, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuRadioItem = React16.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs10(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx17("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx17(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx17(Circle2, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
var DropdownMenuLabel = React16.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx17(
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
var DropdownMenuSeparator = React16.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx17(
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
  return /* @__PURE__ */ jsx17(
    "span",
    {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props
    }
  );
}, "DropdownMenuShortcut");
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/components/ui/index.ts
import { DynamicIcon } from "lucide-react/dynamic";

// src/components/ui/form.tsx
import * as React18 from "react";
import { Slot as Slot3 } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext
} from "react-hook-form";

// src/components/ui/label.tsx
import * as React17 from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx18 } from "react/jsx-runtime";
var labelVariants = cva4(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label3 = React17.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx18(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label3.displayName = LabelPrimitive.Root.displayName;

// src/components/ui/form.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
var Form = FormProvider;
var FormFieldContext = React18.createContext(
  {}
);
var FormField = /* @__PURE__ */ __name(({
  ...props
}) => {
  return /* @__PURE__ */ jsx19(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx19(Controller, { ...props }) });
}, "FormField");
var useFormField = /* @__PURE__ */ __name(() => {
  const fieldContext = React18.useContext(FormFieldContext);
  const itemContext = React18.useContext(FormItemContext);
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
var FormItemContext = React18.createContext(
  {}
);
var FormItem = React18.forwardRef(({ className, ...props }, ref) => {
  const id = React18.useId();
  return /* @__PURE__ */ jsx19(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx19("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
var FormLabel = React18.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx19(
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
var FormControl = React18.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx19(
    Slot3,
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
var FormDescription = React18.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx19(
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
var FormMessage = React18.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx19(
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
import * as React19 from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { jsx as jsx20 } from "react/jsx-runtime";
var HoverCard = HoverCardPrimitive.Root;
var HoverCardTrigger = HoverCardPrimitive.Trigger;
var HoverCardContent = React19.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx20(
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

// src/components/ui/input.tsx
import * as React20 from "react";
import { jsx as jsx21 } from "react/jsx-runtime";
var Input = React20.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx21(
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

// src/components/ui/input-otp.tsx
import * as React21 from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { jsx as jsx22, jsxs as jsxs11 } from "react/jsx-runtime";
var InputOTP = React21.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx22(
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
var InputOTPGroup = React21.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx22("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React21.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React21.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxs11(
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
        hasFakeCaret && /* @__PURE__ */ jsx22("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx22("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React21.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx22("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsx22(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";

// src/components/ui/menubar.tsx
import * as React22 from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check as Check4, ChevronRight as ChevronRight4, Circle as Circle3 } from "lucide-react";
import { jsx as jsx23, jsxs as jsxs12 } from "react/jsx-runtime";
function MenubarMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx23(MenubarPrimitive.Menu, { ...props });
}
__name(MenubarMenu, "MenubarMenu");
function MenubarGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx23(MenubarPrimitive.Group, { ...props });
}
__name(MenubarGroup, "MenubarGroup");
function MenubarPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx23(MenubarPrimitive.Portal, { ...props });
}
__name(MenubarPortal, "MenubarPortal");
function MenubarRadioGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx23(MenubarPrimitive.RadioGroup, { ...props });
}
__name(MenubarRadioGroup, "MenubarRadioGroup");
function MenubarSub({
  ...props
}) {
  return /* @__PURE__ */ jsx23(MenubarPrimitive.Sub, { "data-slot": "menubar-sub", ...props });
}
__name(MenubarSub, "MenubarSub");
var Menubar = React22.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx23(
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
var MenubarTrigger = React22.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx23(
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
var MenubarSubTrigger = React22.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs12(
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
      /* @__PURE__ */ jsx23(ChevronRight4, { className: "ml-auto h-4 w-4" })
    ]
  }
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;
var MenubarSubContent = React22.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx23(
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
var MenubarContent = React22.forwardRef(
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => /* @__PURE__ */ jsx23(MenubarPrimitive.Portal, { children: /* @__PURE__ */ jsx23(
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
var MenubarItem = React22.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx23(
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
var MenubarCheckboxItem = React22.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs12(
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
      /* @__PURE__ */ jsx23("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx23(MenubarPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx23(Check4, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;
var MenubarRadioItem = React22.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs12(
  MenubarPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx23("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx23(MenubarPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx23(Circle3, { className: "h-4 w-4 fill-current" }) }) }),
      children
    ]
  }
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;
var MenubarLabel = React22.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx23(
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
var MenubarSeparator = React22.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx23(
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
  return /* @__PURE__ */ jsx23(
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
import * as React23 from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva as cva5 } from "class-variance-authority";
import { ChevronDown as ChevronDown2 } from "lucide-react";
import { jsx as jsx24, jsxs as jsxs13 } from "react/jsx-runtime";
var NavigationMenu = React23.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs13(
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
      /* @__PURE__ */ jsx24(NavigationMenuViewport, {})
    ]
  }
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;
var NavigationMenuList = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
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
var navigationMenuTriggerStyle = cva5(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
);
var NavigationMenuTrigger = React23.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs13(
  NavigationMenuPrimitive.Trigger,
  {
    ref,
    className: cn(navigationMenuTriggerStyle(), "group", className),
    ...props,
    children: [
      children,
      " ",
      /* @__PURE__ */ jsx24(
        ChevronDown2,
        {
          className: "relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180",
          "aria-hidden": "true"
        }
      )
    ]
  }
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;
var NavigationMenuContent = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
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
var NavigationMenuViewport = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24("div", { className: cn("absolute left-0 top-full flex justify-center"), children: /* @__PURE__ */ jsx24(
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
var NavigationMenuIndicator = React23.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx24(
  NavigationMenuPrimitive.Indicator,
  {
    ref,
    className: cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx24("div", { className: "relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" })
  }
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

// src/components/ui/pagination.tsx
import * as React24 from "react";
import { ChevronLeft, ChevronRight as ChevronRight5, MoreHorizontal as MoreHorizontal2 } from "lucide-react";
import { jsx as jsx25, jsxs as jsxs14 } from "react/jsx-runtime";
var Pagination = /* @__PURE__ */ __name(({ className, ...props }) => /* @__PURE__ */ jsx25(
  "nav",
  {
    role: "navigation",
    "aria-label": "pagination",
    className: cn("mx-auto flex w-full justify-center", className),
    ...props
  }
), "Pagination");
Pagination.displayName = "Pagination";
var PaginationContent = React24.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx25(
  "ul",
  {
    ref,
    className: cn("flex flex-row items-center gap-1", className),
    ...props
  }
));
PaginationContent.displayName = "PaginationContent";
var PaginationItem = React24.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx25("li", { ref, className: cn("", className), ...props }));
PaginationItem.displayName = "PaginationItem";
var PaginationLink = /* @__PURE__ */ __name(({
  className,
  isActive,
  size = "icon",
  ...props
}) => /* @__PURE__ */ jsx25(
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
}) => /* @__PURE__ */ jsxs14(
  PaginationLink,
  {
    "aria-label": "Go to previous page",
    size: "default",
    className: cn("gap-1 pl-2.5", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx25(ChevronLeft, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx25("span", { children: "Previous" })
    ]
  }
), "PaginationPrevious");
PaginationPrevious.displayName = "PaginationPrevious";
var PaginationNext = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs14(
  PaginationLink,
  {
    "aria-label": "Go to next page",
    size: "default",
    className: cn("gap-1 pr-2.5", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx25("span", { children: "Next" }),
      /* @__PURE__ */ jsx25(ChevronRight5, { className: "h-4 w-4" })
    ]
  }
), "PaginationNext");
PaginationNext.displayName = "PaginationNext";
var PaginationEllipsis = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsxs14(
  "span",
  {
    "aria-hidden": true,
    className: cn("flex h-9 w-9 items-center justify-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx25(MoreHorizontal2, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx25("span", { className: "sr-only", children: "More pages" })
    ]
  }
), "PaginationEllipsis");
PaginationEllipsis.displayName = "PaginationEllipsis";

// src/components/ui/popover.tsx
import * as React25 from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx26 } from "react/jsx-runtime";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverContent = React25.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx26(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx26(
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

// src/components/ui/progress.tsx
import * as React26 from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { jsx as jsx27 } from "react/jsx-runtime";
var Progress = React26.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx27(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx27(
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
import * as React27 from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle as Circle4 } from "lucide-react";
import { jsx as jsx28 } from "react/jsx-runtime";
var RadioGroup4 = React27.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx28(
    RadioGroupPrimitive.Root,
    {
      className: cn("grid gap-2", className),
      ...props,
      ref
    }
  );
});
RadioGroup4.displayName = RadioGroupPrimitive.Root.displayName;
var RadioGroupItem = React27.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx28(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx28(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx28(Circle4, { className: "h-3.5 w-3.5 fill-primary" }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// src/components/ui/resizable.tsx
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { jsx as jsx29 } from "react/jsx-runtime";
var ResizablePanelGroup = /* @__PURE__ */ __name(({
  className,
  ...props
}) => /* @__PURE__ */ jsx29(
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
}) => /* @__PURE__ */ jsx29(
  ResizablePrimitive.PanelResizeHandle,
  {
    className: cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    ),
    ...props,
    children: withHandle && /* @__PURE__ */ jsx29("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", children: /* @__PURE__ */ jsx29(GripVertical, { className: "h-2.5 w-2.5" }) })
  }
), "ResizableHandle");

// src/components/ui/scroll-area.tsx
import * as React28 from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { jsx as jsx30, jsxs as jsxs15 } from "react/jsx-runtime";
var ScrollArea = React28.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs15(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx30(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx30(ScrollBar, {}),
      /* @__PURE__ */ jsx30(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
var ScrollBar = React28.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx30(
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
    children: /* @__PURE__ */ jsx30(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// src/components/ui/select.tsx
import * as React29 from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check as Check5, ChevronDown as ChevronDown3, ChevronUp } from "lucide-react";
import { jsx as jsx31, jsxs as jsxs16 } from "react/jsx-runtime";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React29.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs16(
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
      /* @__PURE__ */ jsx31(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx31(ChevronDown3, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx31(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx31(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx31(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx31(ChevronDown3, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React29.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx31(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs16(
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
      /* @__PURE__ */ jsx31(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx31(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx31(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx31(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React29.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs16(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx31("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx31(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx31(Check5, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx31(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React29.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx31(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/components/ui/separator.tsx
import * as React30 from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx32 } from "react/jsx-runtime";
var Separator5 = React30.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx32(
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
Separator5.displayName = SeparatorPrimitive.Root.displayName;

// src/components/ui/sheet.tsx
import * as React31 from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva as cva6 } from "class-variance-authority";
import { X as X2 } from "lucide-react";
import { jsx as jsx33, jsxs as jsxs17 } from "react/jsx-runtime";
var Sheet = SheetPrimitive.Root;
var SheetTrigger = SheetPrimitive.Trigger;
var SheetClose = SheetPrimitive.Close;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
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
var sheetVariants = cva6(
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
var SheetContent = React31.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs17(SheetPortal, { children: [
  /* @__PURE__ */ jsx33(SheetOverlay, {}),
  /* @__PURE__ */ jsxs17(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxs17(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsx33(X2, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx33("span", { className: "sr-only", children: "Close" })
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
}) => /* @__PURE__ */ jsx33(
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
}) => /* @__PURE__ */ jsx33(
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
var SheetTitle = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx33(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// src/components/ui/sidebar.tsx
import * as React34 from "react";
import { Slot as Slot4 } from "@radix-ui/react-slot";
import { cva as cva7 } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

// src/hooks/use-mobile.ts
import * as React32 from "react";
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React32.useState(
    void 0
  );
  React32.useEffect(() => {
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

// src/components/ui/skeleton.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx34(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-primary/10", className),
      ...props
    }
  );
}
__name(Skeleton, "Skeleton");

// src/components/ui/tooltip.tsx
import * as React33 from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx35 } from "react/jsx-runtime";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip2 = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React33.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx35(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx35(
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
import { jsx as jsx36, jsxs as jsxs18 } from "react/jsx-runtime";
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React34.createContext(null);
function useSidebar() {
  const context = React34.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
__name(useSidebar, "useSidebar");
var SidebarProvider = React34.forwardRef(
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
    const setOpen = React34.useCallback(
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
    const toggleSidebar = React34.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    React34.useEffect(() => {
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
    const contextValue = React34.useMemo(
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
    return /* @__PURE__ */ jsx36(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx36(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx36(
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
var Sidebar = React34.forwardRef(
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
      return /* @__PURE__ */ jsx36(
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
      return /* @__PURE__ */ jsx36(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs18(
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
            /* @__PURE__ */ jsxs18(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsx36(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsx36(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsx36("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxs18(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsx36(
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
          /* @__PURE__ */ jsx36(
            "div",
            {
              className: cn(
                "relative z-10 h-full w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear flex",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsx36(
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
var SidebarTrigger = React34.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs18(
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
        /* @__PURE__ */ jsx36(PanelLeft, {}),
        /* @__PURE__ */ jsx36("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = React34.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx36(
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
var SidebarInset = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarInput = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarHeader = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarFooter = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarSeparator = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
    Separator5,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarGroup = React34.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx36(
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
var SidebarGroupLabel = React34.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot4 : "div";
  return /* @__PURE__ */ jsx36(
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
var SidebarGroupAction = React34.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot4 : "button";
  return /* @__PURE__ */ jsx36(
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
var SidebarGroupContent = React34.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
  "div",
  {
    ref,
    "data-sidebar": "group-content",
    className: cn("w-full text-sm", className),
    ...props
  }
));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = React34.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
  "ul",
  {
    ref,
    "data-sidebar": "menu",
    className: cn("flex w-full min-w-0 flex-col gap-1", className),
    ...props
  }
));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = React34.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
  "li",
  {
    ref,
    "data-sidebar": "menu-item",
    className: cn("group/menu-item relative", className),
    ...props
  }
));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva7(
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
var SidebarMenuButton = React34.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot4 : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsx36(
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
    return /* @__PURE__ */ jsxs18(Tooltip2, { children: [
      /* @__PURE__ */ jsx36(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsx36(
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
var SidebarMenuAction = React34.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot4 : "button";
  return /* @__PURE__ */ jsx36(
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
var SidebarMenuBadge = React34.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
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
var SidebarMenuSkeleton = React34.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React34.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs18(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsx36(
          Skeleton,
          {
            className: "size-4 rounded-md",
            "data-sidebar": "menu-skeleton-icon"
          }
        ),
        /* @__PURE__ */ jsx36(
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
var SidebarMenuSub = React34.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx36(
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
var SidebarMenuSubItem = React34.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx36("li", { ref, ...props }));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = React34.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot4 : "a";
  return /* @__PURE__ */ jsx36(
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

// src/components/ui/slider.tsx
import * as React35 from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { jsx as jsx37, jsxs as jsxs19 } from "react/jsx-runtime";
var Slider = React35.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs19(
  SliderPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx37(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsx37(SliderPrimitive.Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsx37(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;

// src/components/ui/sonner.tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { jsx as jsx38 } from "react/jsx-runtime";
var Toaster = /* @__PURE__ */ __name(({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx38(
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
import * as React36 from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { jsx as jsx39 } from "react/jsx-runtime";
var Switch = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx39(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx39(
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
import * as React37 from "react";
import { jsx as jsx40 } from "react/jsx-runtime";
var Table = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx40(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
var TableHeader = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
var TableBody = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
var TableFooter = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
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
var TableRow = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
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
var TableHead = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
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
var TableCell = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
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
var TableCaption = React37.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx40(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-muted-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";

// src/components/ui/tabs.tsx
import * as React38 from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { jsx as jsx41 } from "react/jsx-runtime";
var Tabs = TabsPrimitive.Root;
var TabsList = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx41(
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
var TabsTrigger = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx41(
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
var TabsContent = React38.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx41(
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
import * as React39 from "react";
import { jsx as jsx42 } from "react/jsx-runtime";
var Textarea = React39.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx42(
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
import * as React41 from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

// src/components/ui/toggle.tsx
import * as React40 from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva as cva8 } from "class-variance-authority";
import { jsx as jsx43 } from "react/jsx-runtime";
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
var Toggle = React40.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx43(
  TogglePrimitive.Root,
  {
    ref,
    className: cn(toggleVariants({ variant, size, className })),
    ...props
  }
));
Toggle.displayName = TogglePrimitive.Root.displayName;

// src/components/ui/toggle-group.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
var ToggleGroupContext = React41.createContext({
  size: "default",
  variant: "default"
});
var ToggleGroup = React41.forwardRef(({ className, variant, size, children, ...props }, ref) => /* @__PURE__ */ jsx44(
  ToggleGroupPrimitive.Root,
  {
    ref,
    className: cn("flex items-center justify-center gap-1", className),
    ...props,
    children: /* @__PURE__ */ jsx44(ToggleGroupContext.Provider, { value: { variant, size }, children })
  }
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
var ToggleGroupItem = React41.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = React41.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsx44(
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
export {
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
  DynamicIcon,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  Separator5 as Separator,
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
  Skeleton,
  Slider,
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
  Toaster,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip2 as Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  badgeVariants,
  buttonVariants,
  navigationMenuTriggerStyle,
  toggleVariants,
  useFormField,
  useSidebar
};
//# sourceMappingURL=ui.mjs.map