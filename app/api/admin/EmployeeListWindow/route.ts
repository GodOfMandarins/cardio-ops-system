import { NextResponse } from "next/server";
import {
  initiateEmployeeFormOpening,
  submitEmployeeData,
} from "@/src/Admin/controller/EmployeeListController";

export async function GET() {
  try {
    const employees = await initiateEmployeeFormOpening();
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko gauti darbuotoju.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const employee = await submitEmployeeData(payload);

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko issaugoti darbuotojo.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
