import { NextResponse } from "next/server";
import {
  getSurgeryRooms,
  initiateWindowOpening,
} from "@/src/Employee/controller/SurgeryRoomListController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "initiateWindowOpening";

    if (action === "initiateWindowOpening") {
      const result = initiateWindowOpening();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "getSurgeryRooms") {
      const result = await getSurgeryRooms();
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, message: "Nezinomas operaciniu uzimtumo veiksmas." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko gauti operaciniu uzimtumo.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
