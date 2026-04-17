import { NextResponse } from "next/server";
import {
  initiateOrganRegistrationWindowOpening,
  submitOrganData,
} from "@/src/Admin/controller/OrganRegistrationController";

export async function GET() {
  try {
    const organs = await initiateOrganRegistrationWindowOpening();
    return NextResponse.json({ success: true, data: organs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko gauti organu.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await submitOrganData(payload);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko issaugoti organo.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
