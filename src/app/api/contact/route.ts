import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // 1. Send to Formspree (Server-to-Server)
    // Ad-blockers cannot see or block this request.
    const formspreeResponse = await fetch("https://formspree.io/f/xzdrejeq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    if (!formspreeResponse.ok) {
      const errorText = await formspreeResponse.text();
      console.error("Formspree Server Error:", errorText);
      return NextResponse.json({ error: "Email provider rejected request" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Internal API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}