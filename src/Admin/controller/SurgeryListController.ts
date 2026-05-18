import { RecommendDoctorByStatistics } from "@/src/Admin/controller/DoctorRecommendationController";
import { EmployeeService } from "@/src/Models/Employee";
import type { DoctorListItem } from "@/src/Models/Employee";
import type {
  SurgeryDoctorAssignment,
  SurgeryFormData,
  SurgeryListItem,
  SurgerySubmissionData,
  SurgerySubmissionResult,
  SurgeryTimeOption,
  TimeInterval,
  PossibleTimeContext,
} from "@/src/Models/Surgery";
import { SurgeryService } from "@/src/Models/Surgery";
import type { SurgeryRoomUsageItem } from "@/src/Models/SurgeryRoom";
import { SurgeryRoomService } from "@/src/Models/SurgeryRoom";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";
import { fetchEmployees } from "@/src/Shared/repositories/AdminRepository";
import { fetchPatientsByCodes } from "@/src/Shared/repositories/PatientRepository";
import {
  fetchSurgeryDoctorAssignments,
  fetchSurgeries,
  saveSurgery as persistSurgery,
  removeSurgery,
} from "@/src/Shared/repositories/SurgeryRepository";
import { fetchOperatingRoomsUsage } from "@/src/Shared/repositories/SurgeryRoomRepository";
import { fetchSurgeryResults } from "@/src/Shared/repositories/SurgeryResultsRepository";

export interface SurgeryFormOpening {
  showSurgeryForm: true;
}

const PRIORITY_INTERVAL_DAYS: Record<string, number> = {
  "1": 1,
  "2": 3,
  "3": 7,
  "4": 14,
  "5": 30,
};

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 16;
const MAX_REPLACEMENT_DEPTH = 12;

export function initiateSurgeryFormOpening(): SurgeryFormOpening {
  return openSurgeryForm();
}

export function openSurgeryForm(): SurgeryFormOpening {
  return { showSurgeryForm: true };
}

export async function filterSurgeryByTime(
  data: SurgeryFormData
): Promise<SurgeryTimeOption[]> {
  return submitExaminationData(data);
}

export function validateData(data: SurgeryFormData): string | null {
  if (!data.tipas) return "Pasirinkite operacijos tipą.";
  if (!PRIORITY_INTERVAL_DAYS[data.prioritetas]) {
    return "Pasirinkite operacijos prioritetą.";
  }
  if (!["1", "2", "3", "4", "5"].includes(data.sudetingumas)) {
    return "Pasirinkite operacijos sudėtingumą.";
  }
  if (!/^\d{11}$/.test(data.pacientas)) {
    return "Paciento asmens kodas turi būti sudarytas iš 11 skaitmenų.";
  }
  if (!Number.isInteger(data.trukmeMin) || data.trukmeMin < 30) {
    return "Operacijos trukmė turi būti bent 30 minučių.";
  }
  if (data.trukmeMin > 480) {
    return "Operacijos trukmė negali viršyti 480 minučių.";
  }

  return null;
}

export async function submitExaminationData(
  data: SurgeryFormData
): Promise<SurgeryTimeOption[]> {
  // Step 1: validate surgery form data from AdminWindow popup
  // Step 2: search for available operating room / doctor slots
  const validationError = validateData(data);
  if (validationError) throw new Error(validationError);

  const patient = await fetchPatientsByCodes([data.pacientas]);
  if (patient.length === 0) {
    throw new Error("Pacientas su tokiu asmens kodu nerastas.");
  }

  const [surgeries, surgeryRooms, employees, surgeryResults, doctorAssignments] =
    await Promise.all([
      fetchSurgeries(),
      fetchOperatingRoomsUsage(),
      fetchEmployees(),
      fetchSurgeryResults(),
      fetchSurgeryDoctorAssignments(),
    ]);

  const doctors = employees
    .filter((employee) => employee.role === "gydytojas")
    .map((employee) => ({
      asmensKodas: employee.asmensKodas,
      vardas: employee.vardas,
      pavarde: employee.pavarde,
      elPastas: employee.elPastas,
      telNr: employee.telNr,
      patirtiesMetai: employee.patirtiesMetai,
    }));

  const options = findNearestPossibleSurgeryTimes({
    surgery: data,
    surgeries,
    surgeryRooms,
    doctors,
    surgeryResults,
    doctorAssignments,
  });

  if (options.length === 0) {
    throw new Error("Nepavyko rasti tinkamo operacijos laiko.");
  }

  return options;
}

export async function saveSurgery(
  data: SurgerySubmissionData
): Promise<SurgerySubmissionResult> {
  const validationError = validateData(data);
  if (validationError) throw new Error(validationError);

  const selectedDoctor = data.selectedTime.rekomenduojamiGydytojai.some(
    (doctor) => doctor.asmensKodas === data.gydytojasId
  );
  if (!selectedDoctor) {
    throw new Error("Pasirinktas gydytojas nėra rekomenduotų gydytojų sąraše.");
  }

  const savedSurgery = await persistSurgery(data);
  const replacedSurgery = data.selectedTime.pakeiciamaOperacija;
  const nextOptions = replacedSurgery
    ? await submitExaminationData({
        tipas: replacedSurgery.tipas,
        prioritetas: replacedSurgery.prioritetas,
        trukmeMin: replacedSurgery.trukmeMin,
        sudetingumas: replacedSurgery.sudetingumas,
        pacientas: replacedSurgery.pacientas,
      })
    : [];

  if (replacedSurgery && nextOptions.length === 0) {
    throw new Error(
      "Operacija užėmė vietą, bet nerasta naujo laiko perkeltai operacijai."
    );
  }

  return {
    savedSurgery,
    replacedSurgery,
    nextOptions,
    warning: replacedSurgery ? showWarning() : null,
  };
}

export function showWarning(): string {
  return "Operacija užėmė vietą. Pasirinkite perkėlimo laiką";
}

function findNearestPossibleSurgeryTimes(
  context: PossibleTimeContext
): SurgeryTimeOption[] {
  let interval = getIntervalByPriority(context.surgery.prioritetas);
  let searchCount = 0;

  while (searchCount < MAX_REPLACEMENT_DEPTH) {
    const freeOptions = findPossibleSurgerySlots(context, interval, false);
    if (freeOptions.length > 0) {
      return freeOptions
        .sort(compareOptionsByTime)
        .filter(uniqueOption)
        .slice(0, 10);
    }

    const lowerPrioritySurgeries = filterLowerPrioritySurgeries(
      context.surgery,
      context.surgeries,
      interval
    );

    if (lowerPrioritySurgeries.length > 0) {
      const replacementOptions = findPossibleSurgerySlots(
        context,
        interval,
        true
      ).filter((option) => option.pakeiciamaOperacija !== null);
      if (replacementOptions.length > 0) {
        return replacementOptions
          .sort(compareOptionsByTime)
          .filter(uniqueOption)
          .slice(0, 10);
      }
    }

    interval = addIntervalDurationToCurrentIntervalEndingTime(
      interval,
      context.surgery.prioritetas
    );
    searchCount += 1;
  }

  return [];
}

// Step 4: build and evaluate candidate slots inside a given interval
function findPossibleSurgerySlots(
  context: PossibleTimeContext,
  interval: TimeInterval,
  allowLowerPriorityReplacement: boolean
): SurgeryTimeOption[] {
  const surgeriesInInterval = getSurgeriesByTimeInterval(
    context.surgeries,
    interval
  );
  const surgeryRooms = getSurgeryRoomsBySurgeries(
    context.surgeryRooms,
    surgeriesInInterval
  );
  const roomsByType = filterSurgeriesByType(context.surgery, surgeryRooms);
  const slots = buildSlots(interval, context.surgery.trukmeMin);
  const options: SurgeryTimeOption[] = [];

  for (const slot of slots) {
    for (const room of roomsByType) {
      const overlappingSurgeries = surgeriesInInterval.filter(
        (surgery) =>
          surgery.operacineNr === room.nr &&
          SurgeryService.overlaps(
            SurgeryService.toDateTime(surgery.data, surgery.pradziosLaikas),
            SurgeryService.addMinutes(SurgeryService.toDateTime(surgery.data, surgery.pradziosLaikas), surgery.trukmeMin),
            slot.start,
            slot.end
          )
      );
      const replacement = selectLowerPriorityReplacement(
        context.surgery,
        overlappingSurgeries
      );

      if (overlappingSurgeries.length > 1) continue;
      if (overlappingSurgeries.length === 1 && !replacement) continue;
      if (replacement && !allowLowerPriorityReplacement) continue;

      const doctors = getDoctorsBySurgeries(
        context,
        slot.start,
        slot.end,
        replacement?.id ?? null
      );
      const recommendation = RecommendDoctorByStatistics(
        { tipas: context.surgery.tipas } as SurgeryListItem,
        doctors,
        context.surgeryResults
      );

      if (recommendation.doctors.length === 0) continue;

      options.push({
        data: formatDate(slot.start),
        pradziosLaikas: formatTime(slot.start),
        pabaigosLaikas: formatTime(slot.end),
        operacineNr: room.nr,
        rekomenduojamiGydytojai: recommendation.doctors,
        pakeiciamaOperacija: replacement,
      });
    }
  }

  return options;
}

function getIntervalByPriority(priority: string): TimeInterval {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    WORK_START_HOUR,
    0,
    0,
    0
  );

  const days = PRIORITY_INTERVAL_DAYS[priority] ?? 30;
  const intervalEnd = new Date(todayStart);
  intervalEnd.setDate(intervalEnd.getDate() + Math.max(0, days - 1));
  intervalEnd.setHours(WORK_END_HOUR, 0, 0, 0);

  return { start: todayStart, end: intervalEnd };
}

function addIntervalDurationToCurrentIntervalEndingTime(
  interval: TimeInterval,
  priority: string
): TimeInterval {
  const days = PRIORITY_INTERVAL_DAYS[priority] ?? 30;
  return {
    start: interval.start,
    end: new Date(interval.end.getTime() + days * 24 * 60 * 60 * 1000),
  };
}

function getSurgeriesByTimeInterval(
  surgeries: SurgeryListItem[],
  interval: TimeInterval
): SurgeryListItem[] {
  return surgeries.filter((surgery) => {
    const surgeryStart = toDateTime(surgery.data, surgery.pradziosLaikas);
    const surgeryEnd = addMinutes(surgeryStart, surgery.trukmeMin);
    return overlaps(surgeryStart, surgeryEnd, interval.start, interval.end);
  });
}

function filterLowerPrioritySurgeries(
  surgery: SurgeryFormData,
  surgeries: SurgeryListItem[],
  interval: TimeInterval
): SurgeryListItem[] {
  return SurgeryService.getSurgeriesByTimeInterval(surgeries, interval).filter(
    (plannedSurgery) => Number(plannedSurgery.prioritetas) > Number(surgery.prioritetas)
  );
}

function getSurgeryRoomsBySurgeries(
  surgeryRooms: SurgeryRoomUsageItem[],
  surgeries: SurgeryListItem[]
): SurgeryRoomUsageItem[] {
  return SurgeryRoomService.getSurgeryRoomsBySurgeries(surgeryRooms, surgeries);
}

// Step 5: only keep operating rooms that support the requested surgery type
function filterSurgeriesByType(
  surgery: SurgeryFormData,
  surgeryRooms: SurgeryRoomUsageItem[]
): SurgeryRoomUsageItem[] {
  return surgeryRooms.filter(
    (room) => room.atliekamosOperacijosTipas === surgery.tipas
  );
}

function getDoctorsBySurgeries(
  context: PossibleTimeContext,
  start: Date,
  end: Date,
  ignoredSurgeryId: number | null
): DoctorListItem[] {
  return EmployeeService.getDoctorsBySurgeries(context, start, end, ignoredSurgeryId);
}


function selectLowerPriorityReplacement(
  surgery: SurgeryFormData,
  overlappingSurgeries: SurgeryListItem[]
): SurgeryListItem | null {
  return (
    overlappingSurgeries
      .filter(
        (plannedSurgery) =>
          Number(plannedSurgery.prioritetas) > Number(surgery.prioritetas)
      )
      .sort((a, b) => {
        const priorityDiff = Number(b.prioritetas) - Number(a.prioritetas);
        if (priorityDiff !== 0) return priorityDiff;
        const aStart = SurgeryService.toDateTime(a.data, a.pradziosLaikas).getTime();
        const bStart = SurgeryService.toDateTime(b.data, b.pradziosLaikas).getTime();
        return aStart - bStart;
      })[0] ?? null
  );
}

function buildSlots(interval: TimeInterval, durationMinutes: number) {
  const slots: { start: Date; end: Date }[] = [];
  const current = new Date(interval.start);

  while (current < interval.end) {
    if (current.getHours() < WORK_START_HOUR) {
      current.setHours(WORK_START_HOUR, 0, 0, 0);
    }
    if (current.getHours() >= WORK_END_HOUR) {
      current.setDate(current.getDate() + 1);
      current.setHours(WORK_START_HOUR, 0, 0, 0);
      continue;
    }

    const end = SurgeryService.addMinutes(current, durationMinutes);
    if (end.getHours() <= WORK_END_HOUR && end.getDate() === current.getDate()) {
      slots.push({ start: new Date(current), end });
    }

    current.setMinutes(current.getMinutes() + 60);
  }

  return slots;
}

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function compareOptionsByTime(
  first: SurgeryTimeOption,
  second: SurgeryTimeOption
): number {
  return (
    toDateTime(first.data, first.pradziosLaikas).getTime() -
    toDateTime(second.data, second.pradziosLaikas).getTime()
  );
}

function uniqueOption(
  option: SurgeryTimeOption,
  index: number,
  options: SurgeryTimeOption[]
): boolean {
  return (
    options.findIndex(
      (other) =>
        other.data === option.data &&
        other.pradziosLaikas === option.pradziosLaikas &&
        other.operacineNr === option.operacineNr
    ) === index
  );
}

export interface SurgeryRemovalSuccess {
  success: true;
  message: string;
}

export function initiateSurgeryRemoval(surgery: SurgeryListItem): { openDialog: true; surgery: SurgeryListItem } {
  return { openDialog: true, surgery };
}

export function initiateRemovalNo(): void {
}

export async function initiateRemovalYes(id: number): Promise<SurgeryRemovalSuccess> {
  await removeSurgery(id);
  return { success: true, message: "Operacija sėkmingai pašalinta." };
}
