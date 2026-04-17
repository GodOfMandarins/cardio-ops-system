import { NextResponse } from "next/server";
import {
  initiateOrganRegistrationWindowOpening,
  loadOrgansList,
  requestOrganRegistrationForm,
  submitOrganData,
} from "@/src/Admin/controller/OrganRegistrationController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action =
      searchParams.get("action") ?? "initiateOrganRegistrationWindowOpening";

    if (action === "initiateOrganRegistrationWindowOpening") {
      const result = initiateOrganRegistrationWindowOpening();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "requestOrganRegistrationForm") {
      const form = requestOrganRegistrationForm();
      return NextResponse.json({ success: true, data: form });
    }

    if (action === "loadOrgansList") {
      const organs = await loadOrgansList();
      return NextResponse.json({ success: true, data: organs });
    }

    return NextResponse.json(
      { success: false, message: "Nezinomas organo registracijos veiksmas." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti organo registracijos lango.";
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
