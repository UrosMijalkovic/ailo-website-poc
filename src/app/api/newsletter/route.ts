import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { sendWeeklyInsightsConfirmation } from "@/lib/email";

interface NewsletterRequest {
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterRequest = await request.json();
    const { email, source = "not-ready" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await initializeDatabase();

    // Insert into database (UNIQUE constraint will handle duplicates)
    try {
      await db.execute({
        sql: `
          INSERT INTO newsletter_subscribers (email, source)
          VALUES (?, ?)
        `,
        args: [email, source],
      });
    } catch (dbError: unknown) {
      // Check if it's a unique constraint violation
      if (dbError instanceof Error && dbError.message.includes("UNIQUE constraint")) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Send confirmation email
    await sendWeeklyInsightsConfirmation(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process subscription", details: errorMessage },
      { status: 500 }
    );
  }
}
