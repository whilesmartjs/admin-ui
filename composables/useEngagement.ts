import type { EngagementProperties } from "@whilesmart/engagement";
import { visitorIdOf } from "../lib/analytics";

/** The host app's handle on the console's tracking client; every call is a no-op while tracking is off. */
export function useEngagement() {
  const client = import.meta.client ? useNuxtApp().$engagement : null;

  return {
    track(name: string, properties?: EngagementProperties) {
      client?.track(name, properties);
    },
    page(properties?: EngagementProperties) {
      client?.page(properties);
    },
    visitorId(): string | null {
      return visitorIdOf(client);
    },
  };
}
