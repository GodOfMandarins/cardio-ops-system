import {
  type OperatingRoomFormData,
  submitOperatingRoomData as modelSubmitOperatingRoomData,
} from "@/src/Models/OperatingRoom";
import { fetchOperatingRooms } from "@/src/Shared/repositories/AdminRepository";

const ALLOWED_TYPES = new Set<OperatingRoomFormData["atliekamosOperacijosTipas"]>([
  "Revaskuliarizacine operacija",
  "Voztuvu operacija",
  "Aortos ir didziuju kraujagysliu operacija",
  "Igimtu ydu korekcija",
  "Ritmo chirurgija",
  "Mechanines pagalbos ir transplantacijos operacija",
  "Rekonstrukcine operacija",
  "Sirdies naviku chirurgija",
  "Perikardo chirurgija",
  "Traumu chirurgija",
]);

export async function initiateOperatingRoomFormOpening() {
  return fetchOperatingRooms();
}

export function validateData(data: OperatingRoomFormData): void {
  if (!ALLOWED_TYPES.has(data.atliekamosOperacijosTipas)) {
    throw new Error("Pasirinktas operacines tipas yra neteisingas.");
  }
}

export async function submitOperatingRoomData(payload: unknown) {
  const formData = (payload ?? {}) as OperatingRoomFormData;
  validateData(formData);
  return modelSubmitOperatingRoomData(formData);
}
