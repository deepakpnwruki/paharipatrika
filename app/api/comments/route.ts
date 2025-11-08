import { NextRequest, NextResponse } from 'next/server';

const comments: { [postId: string]: Array<{ id: string; user: string; user_email?: string; user_picture?: string; content: string; createdAt: string; parentId?: string }> } = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');
  if (!postId) return NextResponse.json([], { status: 400 });
  return NextResponse.json(comments[postId] || []);
}

export async function POST(req: NextRequest) {
  const { postId, content, user, email, picture, parentId } = await req.json();
  if (!postId || !content || !user) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const comment = {
    id: Math.random().toString(36).slice(2),
    user,
    user_email: email,
    user_picture: picture,
    content,
    createdAt: new Date().toISOString(),
    parentId: parentId || undefined,
  };
  if (!comments[postId]) comments[postId] = [];
  comments[postId].unshift(comment);
  return NextResponse.json(comment);
}
