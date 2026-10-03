import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Sumber identitas untuk semua komponen client (pengganti supabase.auth). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json(user);
}
