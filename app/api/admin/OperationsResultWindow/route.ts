import { NextResponse } from "next/server";
import {
  initiateOperationsResultOpening,
  openOperationsResultList,
  submitOperationsResultData,
} from "@/src/Admin/controller/OperationResultList";

export async function GET(request: Request) {
  try {
    const action =
      new URL(request.url).searchParams.get("action") ??
      "openOperationsResultList";
    const data =
      action === "initiateOperationsResultOpening"
        ? initiateOperationsResultOpening()
        : await openOperationsResultList();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko atidaryti operaciju rezultatu saraso.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await submitOperationsResultData(await request.json());
    return NextResponse.json(
      { success: true, data, message: "Operacijos rezultatai sekmingai uzregistruoti." },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepavyko uzregistruoti operacijos rezultatu.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
