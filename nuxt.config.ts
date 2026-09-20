export default defineNuxtConfig({
  css: ["@whilesmart/design/styles"],
  runtimeConfig: {
    public: {
      adminApiPrefix: "/api/admin",
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
