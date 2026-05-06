import { NextResponse } from "next/server";
import {
  getResults,
  initiateResultsOpening,
} from "@/src/Employee/controller/ExaminationResultListController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "initiateResultsOpening";
    const pacientas = searchParams.get("pacientas") ?? undefined;

    if (action === "initiateResultsOpening") {
      const result = initiateResultsOpening();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "getResults") {
      const result = await getResults(pacientas);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, message: "Nezinomas tyrimu rezultatu veiksmas." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko gauti tyrimu rezultatu.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
