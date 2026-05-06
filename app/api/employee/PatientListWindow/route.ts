import { NextResponse } from "next/server";
import {
  initiateFormOpening,
  submitExaminationData,
} from "@/src/Employee/controller/ExaminationListController";
import {
  getDoctorPatientsData,
  initiateWindowOpening,
} from "@/src/Employee/controller/PatientListController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gydytojas = searchParams.get("gydytojas") ?? undefined;
    const action = searchParams.get("action") ?? "initiateWindowOpening";

    if (action === "initiateWindowOpening") {
      const result = initiateWindowOpening();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "getDoctorPatients") {
      const result = await getDoctorPatientsData(gydytojas);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "initiateFormOpening") {
      const result = await initiateFormOpening(gydytojas);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, message: "Nezinomas pacientu lango veiksmas." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti tyrimo paskyrimo formos.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gydytojas = searchParams.get("gydytojas") ?? undefined;
    const payload = await request.json();
    const result = await submitExaminationData(payload, gydytojas);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko issaugoti tyrimo.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
