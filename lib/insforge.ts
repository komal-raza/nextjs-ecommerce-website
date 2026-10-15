import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

if (!baseUrl || !anonKey) {
  if (typeof window !== "undefined") {
    console.warn("InsForge credentials are missing. Check NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.");
  }
}

export const insforge = createClient({
  baseUrl,
  anonKey,
});

