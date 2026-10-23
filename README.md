# @whilesmart/eloquent-admin-ui

Nuxt layer holding the administration console: overview, measurements, demographics, users,
email templates, feedback, discounts and AI usage. It renders entirely on
[`@whilesmart/design`](https://github.com/whilesmart/design), so a host that adopts it gets
the same console every other WhileSmart product has.

## Use it

```ts
export default defineNuxtConfig({
  extends: ["@whilesmart/eloquent-admin-ui"],
  runtimeConfig: {
    public: {
      adminApiPrefix: "/api/v1/admin",
      adminAppRoute: "/dashboard",
      adminI18n: true,
      adminNavigation: [
        { label: "Outreach", to: "/admin/outreach", icon: "solar:plain-3-bold-duotone", area: "slate" },
      ],
      adminUserColumns: [
        { label: "Name", key: "name" },
        { label: "Last seen", key: "last_seen_at", type: "datetime" },
        { label: "AI tokens", key: "tokens_used", type: "number" },
      ],
      adminMetricDrilldowns: {
        new_users_series: "/admin/users?joined_on={date}",
      },
      adminBrand: {
        name: "My product",
        logoComponent: "AdminLogo",
        logoProps: { size: "small" },
        logoSrc: "",
        tag: "Admin",
        tagArea: "green",
      },
      adminSkin: {
        name: "product",
        railClass: "product-admin-rail",
        contentClass: "product-admin-content",
      },
    },
  },
});
```

The host provides `useApi`, an `auth` middleware and an `admin` middleware. `logoComponent`
resolves through Nuxt component auto-imports; `logoSrc` is the simpler option when the mark is
just an image. The skin name is exposed as `data-admin-skin` on the content element.

`adminUserColumns` is for a host whose user endpoint returns more than the package's own
resource: the columns render in the order given, with `type` picking the formatting. A key
in `adminMetricDrilldowns` makes that series clickable and sends `{date}` to the path.

## What the host supplies

**The signed-in person.** The layer has no authentication of its own. Write whatever the host
already knows into the shared state the rail reads:

```ts
export default defineNuxtPlugin(() => {
  const { user } = useAuth();
  const viewer = useState("admin.viewer", () => null);
  watchEffect(() => {
    viewer.value = user.value
      ? { name: `${user.value.first_name} ${user.value.last_name}`, email: user.value.email }
      : null;
  });
});
```

**Translations, if it has them.** Every string is written as its own English text, so a host
without a translation layer renders it unchanged. A host that does translate merges
`messages/en.json` into its own locale and sets `adminI18n: true`. Leave it off otherwise, or
the host logs a missing key for every string.

**A PostHog dashboard, if it has one.** The PostHog page frames the publicly shared dashboard
the backend returns from `posthog`. Set it on the backend, never in this layer's public
config: anyone holding that address can read the dashboard.

**Nothing for optional pages.** Feedback and PostHog appear only once the backend's
`features` endpoint says it serves them, so a host without the feedback package or a shared
dashboard is never offered a page that cannot load.

## Analytics

The layer records page views and link clicks on every page of the host app, and sends
them to the engagement endpoint, PostHog, or both. Each is off until the host sets it:

```ts
runtimeConfig: {
  public: {
    engagement: {
      endpoint: "https://api.example.com/api/engagement/events",
      siteKey: "your-site-key-here",
      userState: "user",
    },
    posthog: {
      key: "your-project-token-here",
      host: "https://us.i.posthog.com",
      replay: true,
    },
  },
},
```

`userState` names the host's `useState` key holding the signed-in user. A user there is
identified by id, with their email, username and name; signing out resets the visitor.
Link clicks carry no link text, and replays mask every text, attribute and input. The
PostHog token is browser-visible; never use a personal API key.

**Linking visits to accounts.** Set `identifyPath` to an authenticated path on the host API
and, once a user is signed in, the layer posts this browser's visitor id there through the
host's `useApi`, once per person per page load. The backend then attributes that visitor's
events to the account, so sign-ups can be counted by the source that brought them:

```ts
engagement: {
  endpoint: "https://api.example.com/api/engagement/events",
  siteKey: "your-site-key-here",
  userState: "user",
  identifyPath: "/api/engagement/identify",
},
```

This needs `@whilesmart/engagement` 0.3.0 or later, which exposes the visitor id. A failed
call is ignored, so tracking never breaks a page.

**Recording the host's own events.** `useEngagement()` hands the host the same client, so
its events land beside the page views. Every call does nothing while tracking is off:

```ts
const engagement = useEngagement();
engagement.track("checkout.started", { plan: "pro" });
```

It also offers `page(properties?)` and `visitorId()`, which answers null when there is no
client or it is older than 0.3.0. The client is available as `useNuxtApp().$engagement`
too, and is null while tracking is off.

## Colour

Each destination owns one area colour from the design system. It carries the navigation pill,
the icon tile and the accents on that destination's page, so a reader learns the colour once.
Status colour is reserved for state on a record, such as a feedback item's status, and the two
never meet on one surface.

## Develop

```bash
npm install
npm run check      # icon names, messages, templates, types, layer build
npm run messages   # regenerate messages/en.json from the t() calls in the source
```
