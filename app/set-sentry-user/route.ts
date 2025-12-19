import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const { id, email, name } = await req.json();
  Sentry.setUser({ id, email, username: name || undefined });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
