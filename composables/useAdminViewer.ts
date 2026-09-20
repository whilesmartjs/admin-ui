export interface AdminViewer {
  name: string;
  email: string;
}

/**
 * The person using the console. The package has no auth of its own, so the host writes
 * this state from whatever it already knows about the signed-in user.
 */
export function useAdminViewer() {
  return useState<AdminViewer | null>("admin.viewer", () => null);
}
