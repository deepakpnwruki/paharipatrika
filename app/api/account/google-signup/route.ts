import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, sub, picture } = await req.json();
  if (!name || !email || !sub) {
    return NextResponse.json({ message: "All fields required" }, { status: 400 });
  }
  // Demo: always returns a fake user
  return NextResponse.json({
    user: {
      id: 2,
      name,
      email,
      provider: "google",
      picture: picture || null,
    },
  });
}
