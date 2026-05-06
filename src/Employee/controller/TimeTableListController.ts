import {
  getSurgeries as modelGetSurgeries,
  type SurgeryListItem,
} from "@/src/Models/Surgery";

export interface TimeTableWindowOpening {
  openWindow: true;
}

export interface SurgeriesResult {
  surgeriesList: SurgeryListItem[];
}

export function initiateWindowOpening(): TimeTableWindowOpening {
  return openWindow();
}

export function openWindow(): TimeTableWindowOpening {
  return { openWindow: true };
}

export async function getSurgeries(): Promise<SurgeriesResult> {
  const surgeriesList = await modelGetSurgeries();
  return { surgeriesList };
}
