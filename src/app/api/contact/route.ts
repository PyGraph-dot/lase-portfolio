import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input presence
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // --- UPDATED ID: xdagdaaz ---
    const formspreeResponse = await fetch("https://formspree.io/f/xdagdaaz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    if (!formspreeResponse.ok) {
      const errorText = await formspreeResponse.text();
      console.error("Formspree Upstream Error:", errorText);
      return NextResponse.json(
        { error: "Email service rejected the request" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Internal API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}