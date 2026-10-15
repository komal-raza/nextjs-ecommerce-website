import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const { user, error, status } = await verifyAdmin(req);
  if (error || !user) {
    return NextResponse.json({ isAdmin: false, error }, { status: status || 401 });
  }

  return NextResponse.json({
    isAdmin: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

