import { NextResponse } from "next/server";
import {
  confirmArrival,
  confirmNoShow,
  initiateTransplantationUpdateWindowOpening,
  loadTransplantationsList,
  openTransplantationData,
} from "@/src/Employee/controller/TransplantationUpdate";

function readTransplantationId(searchParams: URLSearchParams): number {
  const transplantacijaId = Number(searchParams.get("transplantacijaId") ?? "");

  if (!Number.isInteger(transplantacijaId) || transplantacijaId <= 0) {
    throw new Error("Transplantacijos identifikatorius yra neteisingas.");
  }

  return transplantacijaId;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "loadTransplantationsList";

    if (action === "loadTransplantationsList") {
      const result = await loadTransplantationsList();
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "initiateTransplantationUpdateWindowOpening") {
      const result = initiateTransplantationUpdateWindowOpening(
        readTransplantationId(searchParams)
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "openTransplantationData") {
      const result = await openTransplantationData(
        readTransplantationId(searchParams)
      );
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Nezinomas transplantacijos atnaujinimo lango veiksmas.",
      },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti transplantacijos atnaujinimo formos.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "";
    const payload = (await request.json()) as { transplantacijaId?: number };
    const transplantacijaId = Number(payload.transplantacijaId ?? "");

    if (!Number.isInteger(transplantacijaId) || transplantacijaId <= 0) {
      throw new Error("Transplantacijos identifikatorius yra neteisingas.");
    }

    if (action === "confirmArrival") {
      const result = await confirmArrival(transplantacijaId);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "confirmNoShow") {
      const result = await confirmNoShow(transplantacijaId);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Nezinomas transplantacijos atnaujinimo veiksmas.",
      },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko issaugoti transplantacijos atnaujinimo.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
