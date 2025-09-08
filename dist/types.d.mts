import { DefaultSession, Session } from 'next-auth';
import { LucideProps } from 'lucide-react';

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
interface TableMetadata extends Core {
    typeName: string;
    keySchema: {
        hashKey: string;
        rangeKey?: string;
    };
    attributes: Array<{
        name: string;
        type: "S" | "N" | "B" | "SS" | "NS" | "BS" | "M" | "L" | "BOOL" | "NULL";
        required: boolean;
    }>;
    indexes?: Array<{
        name: string;
        type: "GSI" | "LSI";
        keySchema: {
            hashKey: string;
            rangeKey?: string;
        };
    }>;
    status: "active" | "deprecated" | "migrating";
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
interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}
interface MenuItem {
    icon: string;
    id: string;
    label: string;
    href: string;
    order: number;
    children?: MenuItem[];
}
interface PackageMenuItem {
    id: string;
    label: string;
    icon?: string;
    route: string;
    children?: PackageMenuItem[];
    permissions?: string[];
}
interface PackageAgentConfig {
    agentId: string;
    agentAliasId: string;
    capabilities: string[];
    systemPrompt?: string;
}
interface PackageInfo {
    name: string;
    slug: string;
    agentConfig?: PackageAgentConfig;
}
interface AppData {
    app: string;
    menu: MenuItem[];
    version: string;
    icon: string;
    status: string;
    visibility: string;
    slug: string;
    name: string;
    description: string;
    id: string;
    agentId?: string;
    agentAliasId?: string;
    identityPoolId?: string;
}
interface ThreePanelLayoutProps {
    children?: React.ReactNode;
    className?: string;
}
interface PackageAgentPanelProps {
    packageInfo?: PackageInfo;
}
interface PackagePageRouterProps {
    currentHash?: string;
    packageSlug?: string;
    packageName?: string;
}
interface PackageContentPanelProps {
    children?: React.ReactNode;
    currentHash?: string;
    packageSlug?: string;
    packageName?: string;
}
interface PackageConfig extends App {
    menuItems: PackageMenuItem[];
    defaultRoute: string;
    agentConfig: PackageAgentConfig;
    layout?: {
        menuCollapsed?: boolean;
        menuWidth?: number;
        agentPanelOpen?: boolean;
    };
}
interface PackageState {
    currentPackage: string;
    currentRoute: string;
    agentPanelOpen: boolean;
    agentWidth: number;
}
interface PackageContextType {
    packageConfig: PackageConfig | null;
    packageLoading: boolean;
    packageState: PackageState;
    setCurrentRoute: (route: string) => void;
    toggleAgentPanel: () => void;
    setAgentWidth: (width: number) => void;
    chatHistory: any[];
    sendMessage: (message: string) => Promise<void>;
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
/**
 * Helper to check if user has admin privileges
 */
declare function isUserAdmin(session: Session | null): boolean;
/**
 * Helper to get user's groups
 */
declare function getUserGroups(session: Session | null): string[];

/**
 * Tenant represents an organization in the system
 */
interface Tenant extends Core {
    code: string;
    name: string;
    domain?: string;
    status: "active" | "inactive" | "suspended";
    settings: {
        maxUsers?: number;
        allowSelfRegistration: boolean;
        requireApproval: boolean;
        defaultUserRole?: string;
    };
    contact: {
        primaryEmail?: string;
        primaryPhone?: string;
        address?: string;
    };
    metadata?: {
        industry?: string;
        size?: string;
        created?: string;
    };
}

/**
 * Props for the DynamicIcon component
 */
interface DynamicIconProps extends LucideProps {
    /** The name of the Lucide icon to render */
    name: string;
    /** Fallback icon component to use if the named icon is not found */
    fallback?: React.ComponentType<any>;
    /** Whether to suppress error messages when icon is not found */
    suppressErrors?: boolean;
}
/**
 * Type for icon name mappings
 */
type IconNameMap = Record<string, string>;
/**
 * Common icon names that can be used with DynamicIcon
 */
type CommonIconNames = "dashboard" | "layout-dashboard" | "users" | "user" | "settings" | "cog" | "gear" | "home" | "house" | "package" | "box" | "database" | "data" | "server" | "cloud" | "code" | "cpu" | "processor" | "monitor" | "screen" | "analytics" | "chart" | "bar-chart-3" | "reports" | "report" | "file-text" | "security" | "shield" | "access" | "key" | "tools" | "wrench" | "help" | "support" | "help-circle" | "logout" | "log-out" | "signin" | "log-in" | "search" | "filter" | "menu" | "bars" | "hamburger" | "close" | "cancel" | "x" | "delete" | "trash" | "trash-2" | "edit" | "pencil" | "add" | "plus" | "create" | "minus" | "remove" | "check" | "tick" | "star" | "favorite" | "heart" | "like" | "bell" | "notification" | "mail" | "email" | "message" | "chat" | "message-square" | "phone" | "calendar" | "date" | "clock" | "time" | "globe" | "world" | "link" | "external" | "external-link" | "download" | "upload" | "file" | "document" | "file-text" | "folder" | "directory" | "image" | "photo" | "video" | "play" | "pause" | "stop" | "square" | "refresh" | "reload" | "sync" | "refresh-cw" | "wifi" | "network" | "bluetooth" | "battery" | "power" | "circle";

/**
 * Shared types and API interfaces
 */
interface CoreResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        requestId: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
        };
    };
}
interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration?: string;
    region: string;
}
interface ApiUserSession {
    user: {
        id: string;
        userId: string;
        email: string;
        name?: string;
        orgId: string;
        roles: string[];
    };
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresAt: number;
}

/**
 * User types and state management
 */

interface User extends Core {
    email: string;
    userId: string;
    groups?: string[];
    isAdmin?: boolean;
    lastLogin?: string;
    preferences?: UserPreferences;
}
interface UserPreferences {
    theme?: "light" | "dark" | "system";
    favoriteApps?: string[];
    recentApps?: string[];
    dashboardLayout?: Record<string, any>;
    notifications?: {
        email?: boolean;
        inApp?: boolean;
    };
}
interface UserState extends Core {
    userId: string;
    favoriteApps: string[];
    recentApps: string[];
    preferences: UserPreferences;
}
interface UserResponse {
    user: User;
    preferences?: UserPreferences;
}

export { type ApiUserSession, type App, type AppData, type AwsCredentials, type ChatMessage, type CommonIconNames, type Core, type CoreResponse, type DynamicIconProps, type IconNameMap, type MenuItem, type PackageAgentConfig, type PackageAgentPanelProps, type PackageConfig, type PackageContentPanelProps, type PackageContextType, type PackageInfo, type PackageMenuItem, type PackagePageRouterProps, type PackageState, type TableMetadata, type Tenant, type ThreePanelLayoutProps, type User, type UserPreferences, type UserResponse, type UserState, getUserGroups, isUserAdmin };
