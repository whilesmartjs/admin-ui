import { currentDestination, mergeNavigation, type AdminNavItem } from "../lib/navigation";

export type { AdminNavItem };

/**
 * Every destination owns one area colour. It carries the nav pill, the icon tile and the
 * accents on that destination's own page, so a reader learns the colour once.
 */
const defaults: AdminNavItem[] = [
  { label: "Overview", to: "/admin", icon: "solar:widget-5-bold-duotone", area: "indigo" },
  { label: "Measurements", to: "/admin/metrics", icon: "solar:chart-square-bold-duotone", area: "cyan" },
  { label: "Demographics", to: "/admin/demographics", icon: "solar:global-bold-duotone", area: "teal" },
  { label: "Users", to: "/admin/users", icon: "solar:users-group-rounded-bold-duotone", area: "green" },
  { label: "Email templates", to: "/admin/email-templates", icon: "solar:letter-bold-duotone", area: "violet" },
  { label: "Feedback", to: "/admin/feedback", icon: "solar:chat-round-dots-bold-duotone", area: "amber" },
  { label: "Discounts", to: "/admin/discounts", icon: "solar:tag-price-bold-duotone", area: "rose" },
  { label: "AI usage", to: "/admin/usage", icon: "solar:cpu-bolt-bold-duotone", area: "orange" },
];

export function useAdminNavigation() {
  const configured = useRuntimeConfig().public.adminNavigation;
  const items = mergeNavigation(defaults, Array.isArray(configured) ? configured : []);

  const route = useRoute();
  const current = computed(() => currentDestination(items, route.path));

  return { items, current, area: computed(() => current.value?.area ?? "indigo") };
}
