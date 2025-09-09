/**
 * Server-side auth exports
 * Import from @captify-io/core/auth for server-side auth functionality
 */

export { auth, handlers, signIn, signOut } from "./lib/auth";
export type { Session } from "next-auth";
