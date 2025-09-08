import React from 'react';
import * as node_modules_next_auth_lib from 'node_modules/next-auth/lib';
import * as node_modules_next_auth_lib_types from 'node_modules/next-auth/lib/types';
import * as next from 'next';
import * as next_server from 'next/server';
import * as next_auth from 'next-auth';
import { ClassValue } from 'clsx';

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
declare function runCognitoAdminOperation<T = any>(operation: string, params?: any): Promise<CaptifyResponse<T>>;

declare function useSafeRef<T>(initialValue: T): {
    current: T;
};
declare function useSafeState<T>(initialState: T | (() => T)): readonly [T, () => void] | [T, React.Dispatch<React.SetStateAction<T>>];
declare function useSafeEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
declare const useState: typeof useSafeState;
declare const useRef: typeof useSafeRef;
declare const useEffect: typeof useSafeEffect;

declare const authResult: next_auth.NextAuthResult;
declare const handlers: {
    POST: (req: next_server.NextRequest) => Promise<Response>;
    GET: (req: next_server.NextRequest) => Promise<Response>;
};
declare const auth: ((args_0: next.NextApiRequest, args_1: next.NextApiResponse) => Promise<next_auth.Session | null>) & (() => Promise<next_auth.Session | null>) & ((args_0: next.GetServerSidePropsContext) => Promise<next_auth.Session | null>) & ((args_0: (req: next_auth.NextAuthRequest, ctx: node_modules_next_auth_lib_types.AppRouteHandlerFnContext) => ReturnType<node_modules_next_auth_lib_types.AppRouteHandlerFn>) => node_modules_next_auth_lib_types.AppRouteHandlerFn) & ((args_0: node_modules_next_auth_lib.NextAuthMiddleware) => next_server.NextMiddleware);
declare const signIn: typeof authResult.signIn;
declare const signOut: <R extends boolean = true>(options?: {
    redirectTo?: string;
    redirect?: R;
}) => Promise<R extends false ? any : never>;

declare function cn(...inputs: ClassValue[]): string;

export { type ApiRequest, type CaptifyResponse, apiClient, auth, cn, handlers, runCognitoAdminOperation, signIn, signOut, useEffect, useRef, useSafeEffect, useSafeRef, useSafeState, useState };
