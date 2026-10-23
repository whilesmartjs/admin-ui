import type { EngagementClient } from "@whilesmart/engagement";

declare module "#app" {
  interface NuxtApp {
    $engagement: EngagementClient | null;
  }
}

export {};
