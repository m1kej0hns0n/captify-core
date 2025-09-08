import * as node_modules_next_auth_lib from 'node_modules/next-auth/lib';
import * as node_modules_next_auth_lib_types from 'node_modules/next-auth/lib/types';
import * as next from 'next';
import * as next_server from 'next/server';
import * as next_auth from 'next-auth';
export { Session } from 'next-auth';

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

export { auth, handlers, signIn, signOut };
