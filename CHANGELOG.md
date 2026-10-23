# Changelog

All notable changes to the WhileSmart administration console are documented in this file.

## [0.2.0] - 2026-10-23

- Page views and link clicks on every page of the host app, sent to the engagement endpoint, PostHog, or both, with optional masked session replay.
- PostHog page showing a shared PostHog dashboard, offered once the backend says it serves one.
- A provider can name the discounts table's columns and hide the ones it does not fill.
- Navigation entries for optional pages appear only when the backend serves them.
- Nuxt 4 support, and the design system resolved from the npm registry.

## [0.1.0] - 2026-09-20

- Initial release.
- Overview, measurements, demographics, users, email templates, feedback, discounts and AI usage pages.
- Console shell with a rail that becomes a drawer on a narrow screen, and a colour per destination.
- Host configuration for the API prefix, navigation, brand, skin, user columns and chart drill-downs.
- English strings shipped for a host that translates, and rendered as written for one that does not.
