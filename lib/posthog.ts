import type { PostHog } from "posthog-js";

let client: Promise<PostHog> | undefined;

export function getAdminPosthog(token: string, host: string): Promise<PostHog> {
  if (!client) {
    client = import("posthog-js").then(({ posthog }) =>
      posthog.init(token, {
        api_host: host,
        persistence: "localStorage+cookie",
        capture_pageview: false,
        capture_pageleave: false,
        autocapture: false,
        disable_session_recording: true,
      }, "whilesmart_admin"),
    ).catch((error) => {
      client = undefined;
      throw error;
    });
  }
  return client;
}
