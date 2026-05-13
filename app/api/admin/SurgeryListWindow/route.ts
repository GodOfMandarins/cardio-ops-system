import { NextResponse } from "next/server";
import {
  initiateSurgeryFormOpening,
  saveSurgery,
  submitExaminationData,
} from "@/src/Admin/controller/SurgeryListController";

export async function GET() {
  try {
    const opening = initiateSurgeryFormOpening();
    return NextResponse.json({ success: true, data: opening });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti operacijos įvedimo formos.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const action = new URL(request.url).searchParams.get("action");
    const data =
      action === "saveSurgery"
        ? await saveSurgery(payload)
        : await submitExaminationData(payload);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko pridėti operacijos.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
