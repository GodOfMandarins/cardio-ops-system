import { NextResponse } from "next/server";
import {
  confirmNewRegistration,
  initiateTransplantationRegistrationWindowOpening,
  submitTransplantationRegistrationData,
} from "@/src/Employee/controller/TransplantationController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action =
      searchParams.get("action") ??
      "initiateTransplantationRegistrationWindowOpening";
    const pacientas = searchParams.get("pacientas") ?? "";

    if (action === "initiateTransplantationRegistrationWindowOpening") {
      const result = initiateTransplantationRegistrationWindowOpening(pacientas);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Nezinomas transplantacijos registravimo lango veiksmas.",
      },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti transplantacijos registravimo formos.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action =
      searchParams.get("action") ?? "submitTransplantationRegistrationData";
    const payload = await request.json();

    if (action === "submitTransplantationRegistrationData") {
      const result = await submitTransplantationRegistrationData(payload);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    if (action === "confirmNewRegistration") {
      const result = await confirmNewRegistration(payload);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Nezinomas transplantacijos registravimo veiksmas.",
      },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko uzregistruoti transplantacijos.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
