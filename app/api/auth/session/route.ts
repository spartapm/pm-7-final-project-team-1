import { NextResponse } from "next/server";
import { readSocialTicket, sessionForSocial } from "@/lib/oauth";

export async function GET(req: Request) {
  const ticket = new URL(req.url).searchParams.get("ticket") ?? "";
  const data = await readSocialTicket(ticket);
  if (!data) return NextResponse.json({ ok: false }, { status: 400 });
  const session = await sessionForSocial(data.provider, data.subject);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    provider: data.provider,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
