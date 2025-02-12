import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'session';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.delete(COOKIE_NAME);
  return response;
} 