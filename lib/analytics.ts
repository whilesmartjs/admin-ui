import type { EngagementPerson } from "@whilesmart/engagement";
import type { PostHogConfig } from "posthog-js";

/**
 * Replays carry no text, attribute or console output: an application's pages
 * show its customers' own data.
 */
export function posthogOptions(replay: boolean): Partial<PostHogConfig> {
  return {
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
    mask_all_text: true,
    mask_all_element_attributes: true,
    enable_recording_console_log: false,
    disable_session_recording: !replay,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
    },
  };
}

export interface AnalyticsUser {
  id: string | number;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export function analyticsPerson(user: AnalyticsUser): EngagementPerson {
  const name = user.name || [user.first_name, user.last_name].filter(Boolean).join(" ");
  const properties = Object.fromEntries(
    Object.entries({ email: user.email, username: user.username, name }).filter(([, value]) => value),
  ) as Record<string, string>;

  return { id: String(user.id), properties };
}
