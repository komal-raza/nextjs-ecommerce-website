import { createClient, createAdminClient, type InsForgeClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";
const adminApiKey = process.env.INSFORGE_API_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

if (!baseUrl || !anonKey) {
  if (typeof window !== "undefined") {
    console.warn("InsForge credentials are missing. Check NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.");
  }
}

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export function getClientAuthToken(): string | null {
  try {
    const authInternal = insforge.auth as unknown as {
      tokenManager?: {
        getAccessToken?: () => string | null;
      };
    };
    return authInternal.tokenManager?.getAccessToken?.() ?? null;
  } catch {
    return null;
  }
}

let adminClientInstance: InsForgeClient | null = null;

export function getInsforgeAdmin(): InsForgeClient {
  if (typeof window !== "undefined") {
    throw new Error("getInsforgeAdmin cannot be called from the browser.");
  }
  if (!adminClientInstance) {
    if (!baseUrl || !adminApiKey) {
      throw new Error("Missing InsForge configuration for admin client.");
    }
    adminClientInstance = createAdminClient({
      baseUrl,
      apiKey: adminApiKey,
    });
  }
  return adminClientInstance;
}
