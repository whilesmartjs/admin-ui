export default defineNuxtConfig({
  css: ["@whilesmart/design/styles"],
  runtimeConfig: {
    public: {
      adminApiPrefix: "/api/admin",
      // Tracking for every page of the host app, off until the host sets it.
      // userState names the host's useState key holding the signed-in user.
      engagement: {
        endpoint: "",
        siteKey: "",
        userState: "",
      },
      posthog: {
        key: "",
        host: "",
        replay: false,
      },
      adminAppRoute: "/dashboard",
      // Off by default: the package's strings are their own English text, so a host
      // without messages/en.json merged into its locale would log a missing key for each.
      adminI18n: false,
      adminNavigation: [],
      adminUserColumns: [],
      adminMetricDrilldowns: {},
      adminBrand: {
        name: "Eloquent Admin",
        logoComponent: "",
        logoProps: {},
        logoSrc: "",
        logoMarkSrc: "",
        tag: "Admin",
        tagArea: "indigo",
      },
      adminSkin: {
        name: "default",
        railClass: "",
        contentClass: "",
      },
    },
  },
});
