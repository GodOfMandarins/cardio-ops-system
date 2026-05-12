import type { DoctorListItem, RecommendedDoctorListItem } from "@/src/Models/Employee";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";

export interface RateCounter {
  totalRate: number;
  surgeryCount: number;
}

export function GetDoctorsList(doctorsList: DoctorListItem[]): DoctorListItem[] {
  return doctorsList;
}

export function CountSurgeryRate(
  counter: RateCounter,
  surgeryResult: SurgeryResultListItem
): RateCounter {
  const patientStabilityRate = surgeryResult.pacientoStabilumas;
  const complicationsRate = 6 - surgeryResult.komplikacijuSunkumas;
  const painRate = 6 - surgeryResult.skausmoLygis;
  return {
    totalRate:
      counter.totalRate + (patientStabilityRate + complicationsRate + painRate) / 3,
    surgeryCount: counter.surgeryCount + 1,
  };
}

export function AddLowRate(counter: RateCounter): RateCounter {
  return {
    totalRate: counter.totalRate + 1,
    surgeryCount: counter.surgeryCount,
  };
}

export function DivRateBySurgeryCount(counter: RateCounter): number {
  return Number((counter.totalRate / (counter.surgeryCount + 1)).toFixed(2));
}

export function AddRate(counter: RateCounter): RateCounter {
  return {
    ...counter,
    totalRate: counter.totalRate + 0.5,
  };
}

export function SortByRate(
  doctors: RecommendedDoctorListItem[]
): RecommendedDoctorListItem[] {
  return [...doctors].sort((a, b) => {
    if (b.rodiklis !== a.rodiklis) return b.rodiklis - a.rodiklis;
    return b.patirtiesMetai - a.patirtiesMetai;
  });
}

export function SortByExperience(
  doctors: DoctorListItem[]
): RecommendedDoctorListItem[] {
  return [...doctors]
    .sort((a, b) => b.patirtiesMetai - a.patirtiesMetai)
    .map((doctor) => ({
      ...doctor,
      rodiklis: 0,
      operacijuSkaicius: 0,
      atlikoNorimoTipoOperacija: false,
    }));
}

export function SelectBestDoctors(
  doctors: RecommendedDoctorListItem[]
): RecommendedDoctorListItem[] {
  return doctors.slice(0, 3);
}
