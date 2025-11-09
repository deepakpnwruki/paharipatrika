import { NextResponse } from "next/server";

// Demo: returns a mock Google user if 'signedup' query param is present
export async function GET(req: Request) {
  const url = new URL(req.url);
  const signedup = url.searchParams.get('signedup');
  if (signedup === '1') {
    return NextResponse.json({
      user: {
        id: 101,
        name: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        provider: "google",
        picture: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    });
  }
  return NextResponse.json({ user: null });
}
