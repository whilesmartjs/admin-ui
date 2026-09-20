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
