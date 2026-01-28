import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { sendWaitlistConfirmation } from "@/lib/email";

interface WaitlistRequest {
  email: string;
  city?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistRequest = await request.json();
    const { email, city } = body;

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
          INSERT INTO waitlist_subscribers (email, city)
          VALUES (?, ?)
        `,
        args: [email, city || null],
      });
    } catch (dbError: unknown) {
      // Check if it's a unique constraint violation
      if (dbError instanceof Error && dbError.message.includes("UNIQUE constraint")) {
        return NextResponse.json(
          { error: "Email already on waitlist" },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Send confirmation email
    await sendWaitlistConfirmation(email, city);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing waitlist subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process subscription", details: errorMessage },
      { status: 500 }
    );
  }
}
