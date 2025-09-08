"use client";

import React from "react";
import { useMemo, useEffect, useCallback } from "react";
import { useState } from "../../lib/react-compat";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { DynamicIcon } from "lucide-react/dynamic";
import { Star, ChevronRight, Bot } from "lucide-react";
import { apiClient } from "../../lib/api";
import { useCaptify } from "../providers/CaptifyProvider";
import { useFavorites } from "../../hooks/useFavorites";
import type { App } from "../../types";

export function FavoritesBar() {
  const router = useRouter();
  const { session } = useCaptify();
  const { favoriteApps, loading: favoritesLoading } = useFavorites();
  const [availableApps, setAvailableApps] = useState<App[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Fetch available apps from DynamoDB
  const fetchAvailableApps = useCallback(async () => {
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
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":status": "active",
          },
        },
      });

      if (response.success && response.data?.Items) {
        setAvailableApps(response.data.Items as App[]);
      }
    } catch (error) {
      console.error("Error fetching available apps:", error);
    } finally {
      setAppsLoading(false);
    }
  }, [session?.user]);

  // Load apps when session is available
  useEffect(() => {
    if (session?.user) {
      fetchAvailableApps();
    }
  }, [session?.user, fetchAvailableApps]);

  // Get favorite app objects from available apps
  const favoriteAppObjects = useMemo(() => {
    if (appsLoading || availableApps.length === 0) return [];

    return favoriteApps
      .map((appId: string) =>
        availableApps.find((app: App) => app.id === appId)
      )
      .filter((app): app is App => app !== undefined)
      .slice(0, 8); // Limit to 8 favorites for UI space
  }, [favoriteApps, availableApps, appsLoading]);

  // Don't render if loading or no favorites
  if (appsLoading || favoritesLoading || favoriteAppObjects.length === 0) {
    return null;
  }

  const handleAppClick = (app: App) => {
    // Navigate to the app using its slug
    router.push(`/${app.slug}`);
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center px-2 py-1 gap-2">
        {/* Favorites Section */}
        <div className="flex items-center flex-1 gap-1 overflow-hidden">
          {/* Favorites Label */}
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Favorites
            </span>
          </div>

          {/* Favorite Apps */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {favoriteAppObjects.map((app) => (
              <Button
                key={app.id}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 px-2 py-0.5 h-7 text-xs hover:bg-accent/50 transition-colors"
                onClick={() => handleAppClick(app)}
              >
                <DynamicIcon
                  name={(app as any).icon || "package"}
                  className="h-3 w-3 text-muted-foreground"
                />
                <span className="text-foreground">{app.name}</span>
              </Button>
            ))}

            {/* Show more indicator if there are more than 8 favorites */}
            {favoriteApps.length > 8 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 px-2 py-0.5 h-7 text-xs text-muted-foreground hover:bg-accent/50"
                onClick={() => {
                  // Could open the application launcher here
                  console.log("Show more favorites");
                }}
              >
                <ChevronRight className="h-3 w-3" />
                <span>+{favoriteApps.length - 8}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
