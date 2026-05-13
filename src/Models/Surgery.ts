export interface SurgeryListItem {
  id: number;
  tipas: string;
  prioritetas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  sudetingumas: string;
  pacientas: string;
  operacineNr: number;
}

export interface SurgeryDoctorAssignment {
  operacijaId: number;
  gydytojasId: string;
}

export interface PlannedSurgeryListItem extends SurgeryListItem {
  gydytojuSkaicius: number;
}

export interface SurgeryEditFormData {
  tipas: string;
  prioritetas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  sudetingumas: string;
  operacineNr: number;
}

export interface SurgeryFormData {
  tipas: string;
  prioritetas: string;
  trukmeMin: number;
  sudetingumas: string;
  pacientas: string;
}

export interface SurgeryTimeOption {
  data: string;
  pradziosLaikas: string;
  pabaigosLaikas: string;
  operacineNr: number;
  rekomenduojamiGydytojai: import("@/src/Models/Employee").RecommendedDoctorListItem[];
  pakeiciamaOperacija: SurgeryListItem | null;
}

export interface SurgerySubmissionData extends SurgeryFormData {
  selectedTime: SurgeryTimeOption;
  gydytojasId: string;
  perkeliamaOperacijaId?: number;
}

export interface SurgerySubmissionResult {
  savedSurgery: SurgeryListItem;
  replacedSurgery: SurgeryListItem | null;
  nextOptions: SurgeryTimeOption[];
  warning: string | null;
}

export function CheckSurgeryType(surgery: Pick<SurgeryListItem, "tipas">): string {
  return surgery.tipas;
}

export interface TimeInterval {
  start: Date;
  end: Date;
}

export interface PossibleTimeContext {
  surgery: SurgeryFormData;
  surgeries: SurgeryListItem[];
  surgeryRooms: import("@/src/Models/SurgeryRoom").SurgeryRoomUsageItem[];
  doctors: import("@/src/Models/Employee").DoctorListItem[];
  surgeryResults: import("@/src/Models/SurgeryResults").SurgeryResultListItem[];
  doctorAssignments: SurgeryDoctorAssignment[];
}

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export class SurgeryService {
  static toDateTime(date: string, time: string): Date {
    return toDateTime(date, time);
  }

  static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  static overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return overlaps(startA, endA, startB, endB);
  }

  static getSurgeriesByTimeInterval(
    surgeries: SurgeryListItem[],
    interval: TimeInterval
  ): SurgeryListItem[] {
    return surgeries.filter((surgery) => {
      const surgeryStart = toDateTime(surgery.data, surgery.pradziosLaikas);
      const surgeryEnd = addMinutes(surgeryStart, surgery.trukmeMin);
      return overlaps(surgeryStart, surgeryEnd, interval.start, interval.end);
    });
  }
}
