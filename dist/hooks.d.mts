import { DefaultSession, Session } from 'next-auth';
import { MutableRefObject } from 'react';

declare function useIsMobile(): boolean;

/**
 * Core base interfaces and shared types
 */
interface Core {
    id: string;
    slug: string;
    tenantId: string;
    name: string;
    app: string;
    order: string;
    fields: Record<string, any>;
    description: string;
    ownerId: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

/**
 * Package configuration and state management types
 */

interface App extends Core {
    version: string;
    status: "active" | "inactive" | "maintenance" | "deprecated";
    category: string;
    visibility: "public" | "internal" | "private";
    icon: string;
    enabled?: boolean;
    menu: MenuItem[];
    identityPoolId?: string;
    agentId?: string;
    agentAliasId?: string;
}
interface MenuItem {
    icon: string;
    id: string;
    label: string;
    href: string;
    order: number;
    children?: MenuItem[];
}

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            groups?: string[];
            isAdmin?: boolean;
        } & DefaultSession["user"];
        accessToken?: string;
        idToken?: string;
        refreshToken?: string;
        awsTokenExpiresAt?: number;
        groups?: string[];
        isAdmin?: boolean;
        captifyStatus?: string | null;
        error?: string;
    }
    interface JWT {
        sub?: string;
        email?: string;
        name?: string;
        accessToken?: string;
        idToken?: string;
        refreshToken?: string;
        awsTokenExpiresAt?: number;
        accessTokenExpires?: number;
        groups?: string[];
        isAdmin?: boolean;
        captifyStatus?: string | null;
        error?: string;
    }
}

type UserAccessProfile = any;
declare function useApplicationAccess(): {
    loading: boolean;
    error: string | null;
    myApps: App[];
    allApps: App[];
    pendingRequests: any[];
    requestAccess: (appId: string, justification: string, requestedRole?: string, autoExpireDays?: number) => Promise<boolean>;
    getAccessProfile: (appId: string) => Promise<UserAccessProfile | null>;
    hasAccess: (appId: string) => boolean;
    hasPendingRequest: (appId: string) => boolean;
    refresh: {
        allApps: () => Promise<void>;
        myApps: () => Promise<void>;
        pendingRequests: () => Promise<void>;
    };
};
/**
 * Hook for admin functions
 */
declare function useApplicationAdmin(): {
    loading: boolean;
    error: string | null;
    pendingRequests: any[];
    approveRequest: (requestId: string, roleId: string, reviewNotes?: string) => Promise<boolean>;
    rejectRequest: (requestId: string, reviewNotes: string) => Promise<boolean>;
    grantAccess: (userId: string, appId: string, roleId: string, justification?: string, expireDays?: number) => Promise<boolean>;
    revokeAccess: (userId: string, appId: string, reason?: string) => Promise<boolean>;
    getAppSummary: (appId: string) => Promise<any | null>;
    refresh: {
        pendingRequests: (appId?: string) => Promise<void>;
    };
};

/**
 * Hook for managing user favorites
 * Provides real-time updates when favorites are added/removed
 */
declare function useFavorites(): {
    favoriteApps: string[];
    loading: boolean;
    toggleFavorite: (appId: string) => Promise<void>;
    isFavorite: (appId: string) => boolean;
    refetch: () => Promise<void>;
};

interface CaptifyResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
interface ApiRequest {
    service: string;
    operation: string;
    app?: string;
    table?: string;
    identityPoolId?: string;
    forceRefresh?: boolean;
    data?: {
        values?: Array<{
            [field: string]: any;
        }>;
        fields?: string[];
        index?: string;
        limit?: number;
        start?: any;
        [key: string]: any;
    };
    useCache?: boolean;
}
declare class ApiClient {
    private currentAppIdentityPoolId;
    private currentAppSlug;
    setAppIdentityPool(poolId: string | undefined, appSlug?: string): void;
    getCurrentIdentityPool(): string | undefined;
    run<T = any>(request: ApiRequest): Promise<CaptifyResponse<T>>;
}
declare const apiClient: ApiClient;

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}
interface UseApiReturn<T> extends UseApiState<T> {
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
}
/**
 * Generic hook for API operations
 */
declare function useApi<T = any>(apiCall: (client: typeof apiClient, ...args: any[]) => Promise<CaptifyResponse<T>>): UseApiReturn<T>;
/**
 * Hook for DynamoDB get operations
 */
declare function useGetItem<T = any>(tableName: string): UseApiReturn<T>;
/**
 * Hook for DynamoDB put operations
 */
declare function usePutItem<T = any>(tableName: string): UseApiReturn<T>;
/**
 * Hook for DynamoDB update operations
 */
declare function useUpdateItem<T = any>(tableName: string): UseApiReturn<T>;
/**
 * Hook for DynamoDB delete operations
 */
declare function useDeleteItem(tableName: string): UseApiReturn<{
    success: boolean;
}>;
/**
 * Hook for DynamoDB scan operations
 */
declare function useScanTable<T = any>(tableName: string): UseApiReturn<{
    items: T[];
}>;
/**
 * Hook for auth operations
 * TODO: These hooks need to be implemented with proper auth endpoints
 */
declare function useAuth(): {
    loading: boolean;
    error: null;
};

/**
 * Hook to access current app context and configuration
 * Fetches data directly from DynamoDB when needed
 */
declare function useAppContext(): {
    currentApp: App | undefined;
    availableApps: App[];
    appsLoading: boolean;
    setCurrentApp: (app: App) => void;
    getCurrentAppConfig: () => App | undefined;
    getAppBySlug: (slug: string) => App | undefined;
    isAppAvailable: (slug: string) => boolean;
    getCurrentIdentityPoolId: () => string | undefined;
    getAppAwsConfig: (slug: string) => {
        identityPoolId: string | undefined;
        agentId: string | undefined;
        agentAliasId: string | undefined;
    };
};

/**
 * A safer version of useRef that includes additional error handling
 * and SSR protection for client-side operations
 */
declare function useSafeRef<T>(initialValue: T): MutableRefObject<T>;
/**
 * A useRef wrapper specifically for DOM elements that are null during SSR
 */
declare function useDOMRef<T extends HTMLElement = HTMLElement>(): MutableRefObject<T | null>;
/**
 * Safe way to access ref.current with error handling
 */
declare function safeRefAccess<T>(ref: MutableRefObject<T | null>, callback: (current: T) => void, fallback?: () => void): void;

interface CaptifyContextType {
    session: Session | null;
    isLoading: boolean;
}
declare function useCaptify(): CaptifyContextType;

export { safeRefAccess, useApi, useAppContext, useApplicationAccess, useApplicationAdmin, useAuth, useCaptify, useDOMRef, useDeleteItem, useFavorites, useGetItem, useIsMobile, usePutItem, useSafeRef, useScanTable, useUpdateItem };
