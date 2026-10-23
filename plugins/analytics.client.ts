import { createEngagementClient, type EngagementDestination } from "@whilesmart/engagement";
import { posthogDestination } from "@whilesmart/engagement/posthog";
import { analyticsPerson, posthogOptions, type AnalyticsUser } from "../lib/analytics";

export default defineNuxtPlugin(() => {
  const { engagement, posthog } = useRuntimeConfig().public as unknown as {
    engagement: { endpoint: string; siteKey: string; userState: string };
    posthog: { key: string; host: string; replay: boolean };
  };

  const destinations: EngagementDestination[] = [];
  if (posthog.key && posthog.host) {
    destinations.push(posthogDestination({ token: posthog.key, host: posthog.host, config: posthogOptions(posthog.replay) }));
  }
  const recorded = Boolean(engagement.endpoint && engagement.siteKey);
  if (!recorded && !destinations.length) return;

  const client = createEngagementClient({
    endpoint: recorded ? engagement.endpoint : undefined,
    siteKey: recorded ? engagement.siteKey : undefined,
    autoPageViews: false,
    autoLinkClicks: { text: false },
    destinations,
    // Keep cross-origin events on credential-free keepalive fetch.
    navigator: { sendBeacon: () => false },
  });

  // The landing page can resolve before this plugin runs.
  const router = useRouter();
  let viewed = "";
  const view = (path: string) => {
    if (path === viewed) return;
    viewed = path;
    client.page();
  };
  router.afterEach((to) => view(to.path));
  void router.isReady().then(() => view(router.currentRoute.value.path));

  if (!engagement.userState) return;
  const user = useState<AnalyticsUser | null>(engagement.userState, () => null);
  let identified: string | null = null;
  watch(user, (current) => {
    if (current) {
      const person = analyticsPerson(current);
      if (person.id !== identified) {
        client.identify(person);
        identified = person.id;
      }
    } else if (identified) {
      client.reset();
      identified = null;
    }
  }, { immediate: true });
});
