export type OperationType =
  | "Revaskuliarizacine operacija"
  | "Voztuvu operacija"
  | "Aortos ir didziuju kraujagysliu operacija"
  | "Igimtu ydu korekcija"
  | "Ritmo chirurgija"
  | "Mechanines pagalbos ir transplantacijos operacija"
  | "Rekonstrukcine operacija"
  | "Sirdies naviku chirurgija"
  | "Perikardo chirurgija"
  | "Traumu chirurgija";

export interface OperatingRoomFormData {
  atliekamosOperacijosTipas: OperationType;
}

export interface OperatingRoomListItem {
  nr: number;
  atliekamosOperacijosTipas: OperationType;
}

const ALLOWED_TYPES = new Set<OperationType>([
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

// Saugoja naują operacinę į duomenų bazę
export async function submitOperatingRoomData(
  data: OperatingRoomFormData
): Promise<OperatingRoomListItem> {
  const { createOperatingRoom } = await import(
    "@/src/Shared/repositories/AdminRepository"
  );
  return createOperatingRoom(data);
}
