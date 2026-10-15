import { NextRequest } from "next/server";
import { createClient } from "@insforge/sdk";

export function getAdminEmails(): string[] {
  const configured =
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    "r*******l@gmail.com";

  return configured
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.trim().toLowerCase());
}

export async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { user: null, error: "Authentication token required", status: 401 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

  try {
    const userClient = createClient({
      baseUrl,
      anonKey,
      accessToken: token,
    });

    const { data: userData, error: userErr } = await userClient.auth.getCurrentUser();
    if (userErr || !userData?.user) {
      return { user: null, error: "Invalid or expired session", status: 401 };
    }

    const email = userData.user.email;
    if (!isUserAdmin(email)) {
      return {
        user: null,
        error: "Access denied. Store owner privileges required.",
        status: 403,
      };
    }

    return { user: userData.user, error: null, status: 200 };
  } catch (err: unknown) {
    return {
      user: null,
      error: (err as Error).message || "Admin authorization check failed",
      status: 500,
    };
  }
}

