import {
  AddLowRate,
  AddRate,
  CountSurgeryRate,
  DivRateBySurgeryCount,
  GetDoctorsList,
  SelectBestDoctors,
  SortByExperience,
  SortByRate,
} from "@/src/Admin/controller/DoctorListController";
import type {
  DoctorListItem,
  RecommendedDoctorListItem,
} from "@/src/Models/Employee";
import { PickDoctorsBySurgeryType } from "@/src/Models/Employee";
import type { SurgeryListItem } from "@/src/Models/Surgery";
import { CheckSurgeryType } from "@/src/Models/Surgery";
import {
  GetSurgeryResultsByDoctor,
  type SurgeryResultListItem,
} from "@/src/Models/SurgeryResults";

export interface RecommendedDoctorAssignmentResult {
  surgeryType: string;
  doctors: RecommendedDoctorListItem[];
  assignedDoctor: RecommendedDoctorListItem | null;
}

interface RateCounter {
  totalRate: number;
  surgeryCount: number;
}

export function RecommendDoctorByStatistics(
  surgery: Pick<SurgeryListItem, "tipas">,
  doctorsList: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): RecommendedDoctorAssignmentResult {
  const allDoctors = GetDoctorsList(doctorsList);
  const Type = CheckSurgeryType(surgery);
  const foundDoctors = PickDoctorsBySurgeryType(Type, allDoctors, surgeryResults);

  let sortedDoctors: RecommendedDoctorListItem[];

  if (foundDoctors.length > 3) {
    const ratedDoctors = rateDoctors(foundDoctors, foundDoctors, surgeryResults);
    sortedDoctors = SortByRate(ratedDoctors);
  } else {
    const withTypeDoctors = PickDoctorsBySurgeryType("", allDoctors, surgeryResults);

    if (withTypeDoctors.length > 3) {
      const ratedDoctors = rateDoctors(withTypeDoctors, foundDoctors, surgeryResults);
      sortedDoctors = SortByRate(ratedDoctors);
    } else {
      sortedDoctors = SortByExperience(allDoctors);
    }
  }

  const doctors = SelectBestDoctors(sortedDoctors);
  const assignedDoctor = doctors[0] ?? null;

  return { surgeryType: Type, doctors, assignedDoctor };
}

function rateDoctors(
  doctors: DoctorListItem[],
  doctorsWithSurgeryType: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): RecommendedDoctorListItem[] {
  return doctors.map((doctor) => {
    let counter: RateCounter = { totalRate: 0, surgeryCount: 0 };
    const didSurgeryType = doctorsWithSurgeryType.some(
      (foundDoctor) => foundDoctor.asmensKodas === doctor.asmensKodas
    );

    if (didSurgeryType) counter = AddRate(counter);

    const doctorResults = GetSurgeryResultsByDoctor(
      doctor.asmensKodas,
      surgeryResults
    );
    for (const result of doctorResults) {
      counter = CountSurgeryRate(counter, result);
    }

    counter = AddLowRate(counter);

    return {
      ...doctor,
      rodiklis: DivRateBySurgeryCount(counter),
      operacijuSkaicius: doctorResults.length,
      atlikoNorimoTipoOperacija: didSurgeryType,
    };
  });
}
