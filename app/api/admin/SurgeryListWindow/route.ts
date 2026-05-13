import { NextResponse } from "next/server";
import { fetchSurgeries, fetchSurgeryById } from "@/src/Shared/repositories/SurgeryRepository";
import {
  initiateFormOpening,
  submitEditedSurgery,
} from "@/src/Admin/controller/SurgeryEditController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "getSurgeries";

    if (action === "initiateFormOpening") {
      const id = Number(searchParams.get("id"));
      const surgery = await fetchSurgeryById(id);
      if (!surgery) {
        return NextResponse.json(
          { success: false, message: "Operacija nerasta." },
          { status: 404 }
        );
      }
      const result = initiateFormOpening(surgery);
      return NextResponse.json({ success: true, data: result });
    }

    const surgeries = await fetchSurgeries();
    return NextResponse.json({ success: true, data: surgeries });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko gauti operaciju.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { id: number } & Record<string, unknown>;
    const { id, ...payload } = body;
    const result = await submitEditedSurgery(id, payload);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko atnaujinti operacijos.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
