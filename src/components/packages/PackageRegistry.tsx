"use client";

// Dynamic package loader - no hardcoded imports
export async function loadPackageRegistry(packageName: string) {
  // Prevent execution during SSR/SSG
  if (typeof window === "undefined") {
    return null;
  }

  console.log(`[PackageRegistry] Loading package: ${packageName}`);
  
  try {
    console.log(`[PackageRegistry] Importing package module for: ${packageName}`);
    // Dynamically import the package using the slug
    // Use webpackIgnore to prevent webpack from analyzing this import
    const appModule = await import(/* webpackIgnore: true */ `@captify-io/${packageName}`).catch(() => null);
    if (!appModule) {
      console.warn(`Package @captify-io/${packageName} not available`);
      return null;
    }
    console.log(`[PackageRegistry] Package module loaded:`, appModule);

    // Get the page and component registries from the app module
    const { pageRegistry, componentRegistry } = appModule;

    if (pageRegistry || componentRegistry) {
      console.log(`[PackageRegistry] Available pageRegistry:`, Object.keys(pageRegistry || {}));
      console.log(`[PackageRegistry] Available componentRegistry:`, Object.keys(componentRegistry || {}));
      // Return a function that provides the component for specific routes
      return async (routeName: string) => {
        console.log(`[PackageRegistry] Looking for route: "${routeName}"`);
        // Try pageRegistry first, then componentRegistry
        const componentOrLoader = pageRegistry?.[routeName as keyof typeof pageRegistry] || 
                                  componentRegistry?.[routeName as keyof typeof componentRegistry];
        
        if (componentOrLoader) {
          console.log(`[PackageRegistry] Found entry for route: ${routeName}`);
          
          // Check if it's a dynamic import function (returns a promise)
          if (typeof componentOrLoader === 'function') {
            // Try to call it and see if it returns a promise
            try {
              const result = componentOrLoader();
              if (result && typeof result.then === 'function') {
                console.log(`[PackageRegistry] Loading dynamic import for: ${routeName}`);
                const module = await result;
                // Handle both default and named exports
                const Component = module.default || module[Object.keys(module)[0]];
                console.log(`[PackageRegistry] Dynamic import loaded for: ${routeName}`);
                return Component;
              } else {
                // It's a React component function
                console.log(`[PackageRegistry] Returning direct component for: ${routeName}`);
                return componentOrLoader;
              }
            } catch (error) {
              // If calling it throws, it might be a React component
              console.log(`[PackageRegistry] Returning as React component for: ${routeName}`);
              return componentOrLoader;
            }
          }
          // If it's a string, it's an error (old format)
          else if (typeof componentOrLoader === 'string') {
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