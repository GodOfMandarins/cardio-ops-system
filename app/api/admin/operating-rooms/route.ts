import { NextResponse } from "next/server";
import {
  initiateOperatingRoomFormOpening,
  submitOperatingRoomData,
} from "@/src/Admin/controller/OperatingRoomListController";

export async function GET() {
  try {
    const rooms = await initiateOperatingRoomFormOpening();
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko gauti operaciniu.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const room = await submitOperatingRoomData(payload);

    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepavyko issaugoti operacines.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
