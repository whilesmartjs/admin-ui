import type { AreaColor } from "@whilesmart/design";

export interface AdminBrand {
  name: string;
  logoComponent: string;
  logoProps: Record<string, unknown>;
  logoSrc: string;
  logoMarkSrc: string;
  tag: string;
  tagArea: AreaColor;
}

export interface AdminSkin {
  name: string;
  railClass: string;
  contentClass: string;
}

export function useAdminBrand() {
  const config = useRuntimeConfig().public;
  const configured = (config.adminBrand ?? {}) as Partial<AdminBrand>;
  const skin = (config.adminSkin ?? {}) as Partial<AdminSkin>;

  const brand: AdminBrand = {
    name: configured.name ?? "Eloquent Admin",
    logoComponent: configured.logoComponent ?? "",
    logoProps: configured.logoProps ?? {},
    logoSrc: configured.logoSrc ?? "",
    logoMarkSrc: configured.logoMarkSrc ?? "",
    tag: configured.tag ?? "Admin",
    tagArea: configured.tagArea ?? "indigo",
  };

  // resolveComponent hands back the name itself when nothing is registered under it, which
  // would render an unknown element and show no logo at all. Fall through to logoSrc instead.
  const resolved = brand.logoComponent ? resolveComponent(brand.logoComponent) : null;

  return {
    brand,
    logo: typeof resolved === "string" ? null : resolved,
    appRoute: typeof config.adminAppRoute === "string" ? config.adminAppRoute : "/dashboard",
    skin: {
      name: skin.name ?? "default",
      railClass: skin.railClass ?? "",
      contentClass: skin.contentClass ?? "",
    } as AdminSkin,
  };
}
