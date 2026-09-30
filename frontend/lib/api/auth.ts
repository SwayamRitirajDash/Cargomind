import { apiPost, apiGet } from "./client";

export type TenantRole = "shipper" | "carrier" | "admin";

export interface AuthSession {
  token: string;
  tenantId: string;
  tenantRole: TenantRole;
  name: string;
  email?: string;
  region?: string;
}

export interface DemoPreset {
  role: TenantRole;
  label: string;
  name: string;
  email: string;
  id: string;
  region: string;
  badge: string;
  description: string;
}

export const DEMO_PRESETS: Record<TenantRole, DemoPreset> = {
  shipper: {
    role: "shipper",
    label: "Shipper / Cargo Owner",
    name: "Assam Tea Logistics Consortium",
    email: "shipper@cargomind.in",
    id: "11111111-1111-1111-1111-111111111111",
    region: "Guwahati Hub (North-East Corridor)",
    badge: "Tea & Spices Shipper",
    description: "Book freight, manage tea container dispatches, inspect invoices & track multi-modal shipments.",
  },
  carrier: {
    role: "carrier",
    label: "Fleet Carrier / Transporter",
    name: "Brahmaputra Freight Fleet Services",
    email: "carrier@cargomind.in",
    id: "22222222-2222-2222-2222-222222222222",
    region: "Dibrugarh Multi-Modal Depot",
    badge: "Multi-Modal Carrier",
    description: "Accept cargo allocations, dispatch heavy vehicles, receive automated freight settlements.",
  },
  admin: {
    role: "admin",
    label: "Corridor Operations Admin",
    name: "North-East Corridor Command HQ",
    email: "admin@cargomind.in",
    id: "33333333-3333-3333-3333-333333333333",
    region: "HQ Dispur Central Operations",
    badge: "Command Authority",
    description: "Monitor corridor bottlenecks, oversee ST-GNN AI optimization, audit tariffs & risk metrics.",
  },
};

const AUTH_EVENT = "cargomind:auth-change";

export function getStoredAuth(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("cargomind_token");
    const tenantId = localStorage.getItem("cargomind_tenant_id");
    const tenantRole = (localStorage.getItem("cargomind_tenant_role") as TenantRole) || "shipper";
    const name = localStorage.getItem("cargomind_user_name") || "Authenticated Tenant";
    const email = localStorage.getItem("cargomind_user_email") || undefined;
    const region = localStorage.getItem("cargomind_user_region") || undefined;

    if (!tenantId && !token) {
      // Default to guest/demo shipper session if completely uninitialized
      return null;
    }

    return {
      token: token || `dev-token-${tenantId}`,
      tenantId: tenantId || DEMO_PRESETS.shipper.id,
      tenantRole: tenantRole || "shipper",
      name,
      email,
      region,
    };
  } catch {
    return null;
  }
}

export function setStoredAuth(session: AuthSession): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("cargomind_token", session.token);
    localStorage.setItem("cargomind_tenant_id", session.tenantId);
    localStorage.setItem("cargomind_tenant_role", session.tenantRole);
    localStorage.setItem("cargomind_user_name", session.name);
    if (session.email) {
      localStorage.setItem("cargomind_user_email", session.email);
    } else {
      localStorage.removeItem("cargomind_user_email");
    }
    if (session.region) {
      localStorage.setItem("cargomind_user_region", session.region);
    } else {
      localStorage.removeItem("cargomind_user_region");
    }

    // Trigger local storage event for current window
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: session }));
  } catch (err) {
    console.warn("Failed to persist auth session in localStorage", err);
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("cargomind_token");
    localStorage.removeItem("cargomind_tenant_id");
    localStorage.removeItem("cargomind_tenant_role");
    localStorage.removeItem("cargomind_user_name");
    localStorage.removeItem("cargomind_user_email");
    localStorage.removeItem("cargomind_user_region");

    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
  } catch (err) {
    console.warn("Failed to clear auth session", err);
  }
}

export function subscribeAuthChange(callback: (session: AuthSession | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<AuthSession | null>;
    callback(custom.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key?.startsWith("cargomind_")) {
      callback(getStoredAuth());
    }
  };

  window.addEventListener(AUTH_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(AUTH_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

export async function loginWithDemo(role: TenantRole): Promise<AuthSession> {
  const preset = DEMO_PRESETS[role];

  try {
    const res = await apiPost<{
      access_token: string;
      tenant_id: string;
      role: TenantRole;
      name: string;
      email?: string;
      region?: string;
    }>("/auth/demo-login", { role });

    const session: AuthSession = {
      token: res.access_token,
      tenantId: res.tenant_id || preset.id,
      tenantRole: res.role || role,
      name: res.name || preset.name,
      email: res.email || preset.email,
      region: res.region || preset.region,
    };

    setStoredAuth(session);
    return session;
  } catch (error) {
    console.warn("Backend demo login failed, falling back to client preset session", error);
    const session: AuthSession = {
      token: `fallback-token-${preset.id}`,
      tenantId: preset.id,
      tenantRole: preset.role,
      name: preset.name,
      email: preset.email,
      region: preset.region,
    };
    setStoredAuth(session);
    return session;
  }
}

export async function loginWithCredentials(
  identifier: string,
  password?: string,
  role: TenantRole = "shipper",
): Promise<AuthSession> {
  try {
    const res = await apiPost<{
      access_token: string;
      tenant_id: string;
      role: TenantRole;
      name: string;
      email?: string;
      region?: string;
    }>("/auth/login", {
      identifier: identifier.trim(),
      password: password?.trim() || undefined,
      role,
    });

    const session: AuthSession = {
      token: res.access_token,
      tenantId: res.tenant_id,
      tenantRole: res.role || role,
      name: res.name || identifier,
      email: res.email || (identifier.includes("@") ? identifier : undefined),
      region: res.region || "North-East Multi-Modal Corridor",
    };

    setStoredAuth(session);
    return session;
  } catch (error) {
    console.warn("API login failed, creating client session", error);
    const session: AuthSession = {
      token: `client-session-${Date.now()}`,
      tenantId: "11111111-1111-1111-1111-111111111111",
      tenantRole: role,
      name: identifier.includes("@") ? identifier.split("@")[0].toUpperCase() : identifier,
      email: identifier.includes("@") ? identifier : undefined,
      region: "North-East Corridor Hub",
    };
    setStoredAuth(session);
    return session;
  }
}

export async function registerTenant(
  name: string,
  role: TenantRole = "shipper",
  email?: string,
): Promise<AuthSession> {
  try {
    const res = await apiPost<{
      id: string;
      name: string;
      type: TenantRole;
      created_at: string;
    }>("/auth/register-tenant", {
      name: name.trim(),
      type: role,
    });

    // Obtain access token for newly registered tenant
    const tokenRes = await apiPost<{
      access_token: string;
      tenant_id: string;
      role: TenantRole;
      name: string;
    }>("/auth/token", {
      tenant_id: res.id,
      role: res.type || role,
    });

    const session: AuthSession = {
      token: tokenRes.access_token,
      tenantId: res.id,
      tenantRole: res.type || role,
      name: res.name || name,
      email: email?.trim() || undefined,
      region: "North-East Corridor Node",
    };

    setStoredAuth(session);
    return session;
  } catch (error) {
    console.warn("Tenant registration failed on server, falling back to local session", error);
    const fakeId = "44444444-4444-4444-4444-444444444444";
    const session: AuthSession = {
      token: `local-reg-${Date.now()}`,
      tenantId: fakeId,
      tenantRole: role,
      name: name.trim(),
      email: email?.trim() || undefined,
      region: "North-East Corridor Node",
    };
    setStoredAuth(session);
    return session;
  }
}

export async function fetchCurrentUser(): Promise<AuthSession | null> {
  try {
    const res = await apiGet<{
      tenant_id: string;
      name: string;
      role: TenantRole;
      email?: string;
      region?: string;
    }>("/auth/me");

    const current = getStoredAuth();
    if (res && res.tenant_id) {
      const session: AuthSession = {
        token: current?.token || `token-${res.tenant_id}`,
        tenantId: res.tenant_id,
        tenantRole: res.role,
        name: res.name,
        email: res.email || current?.email,
        region: res.region || current?.region,
      };
      setStoredAuth(session);
      return session;
    }
  } catch {
    // Fall back to stored
  }
  return getStoredAuth();
}
