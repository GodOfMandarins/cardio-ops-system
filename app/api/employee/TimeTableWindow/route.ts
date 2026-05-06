import { NextResponse } from "next/server";
import {
  getSurgeries,
  initiateWindowOpening,
} from "@/src/Employee/controller/TimeTableListController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "initiateWindowOpening";

    if (action === "initiateWindowOpening") {
      const result = initiateWindowOpening();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "getSurgeries") {
      const result = await getSurgeries();
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, message: "Nezinomas operaciju grafiko veiksmas." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko gauti operaciju grafiko.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
