import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/email";

interface BookingConfirmationRequest {
  email: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingConfirmationRequest = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Send confirmation email
    await sendBookingConfirmation(email, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
