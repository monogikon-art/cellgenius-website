import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, interest, message } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────────────────
        // TODO: Integrate with your preferred email service.
        // Options:
        //   1. SendGrid / Resend API — send email to info@cellgenius-ai.com
        //   2. Store in a database (same Neon DB as PPM if desired)
        //   3. Forward to a webhook (Slack, Teams, etc.)
        //
        // For now, we log the submission and return success.
        // ──────────────────────────────────────────────────────────────────

        console.log("━━━━━ New Contact Form Submission ━━━━━");
        console.log(`Name:     ${name}`);
        console.log(`Email:    ${email}`);
        console.log(`Interest: ${interest || "Not specified"}`);
        console.log(`Message:  ${message}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
