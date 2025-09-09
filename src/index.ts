/**
 * @captify-io/core - Shared components, types, and utilities
 */

// Export all types
export * from "./types";

// Export lib utilities  
export * from "./lib/api";

// Export hooks
export * from "./hooks/use-mobile";
export * from "./hooks/useApplicationAccess";
export * from "./hooks/useFavorites";
// Removed useUser - use apiClient directly for User table operations

// Export CaptifyProvider for convenience
export { CaptifyProvider } from "./components/providers/CaptifyProvider";
