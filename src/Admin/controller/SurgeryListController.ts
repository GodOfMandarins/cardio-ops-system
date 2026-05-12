import {
  GetDoctorsList,
  CountSurgeryRate,
  AddLowRate,
  DivRateBySurgeryCount,
  AddRate,
  SortByRate,
  SortByExperience,
  SelectBestDoctors,
} from "@/src/Admin/controller/DoctorListController";
import type { DoctorListItem, RecommendedDoctorListItem } from "@/src/Models/Employee";
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

    const ratedDoctors: RecommendedDoctorListItem[] = [];

    for (const doctor of foundDoctors) {
      let counter: RateCounter = { totalRate: 0, surgeryCount: 0 };

      const doctorResults = GetSurgeryResultsByDoctor(doctor.asmensKodas, surgeryResults);
      for (const result of doctorResults) {
        counter = CountSurgeryRate(counter, result);
      }

      counter = AddLowRate(counter);

      const rodiklis = DivRateBySurgeryCount(counter);

      ratedDoctors.push({
        ...doctor,
        rodiklis,
        operacijuSkaicius: doctorResults.length,
        atlikoNorimoTipoOperacija: true,
      });
    }
    sortedDoctors = SortByRate(ratedDoctors);
  } else {
    const withTypeDoctors = PickDoctorsBySurgeryType("", allDoctors, surgeryResults);
    if (withTypeDoctors.length > 3) {

      const ratedDoctors: RecommendedDoctorListItem[] = [];
      for (const doctor of withTypeDoctors) {
        let counter: RateCounter = { totalRate: 0, surgeryCount: 0 };

        const DidSurgeryType = foundDoctors.some(
          (d) => d.asmensKodas === doctor.asmensKodas
        );
        if (DidSurgeryType) {
          counter = AddRate(counter);
        }
        const doctorResults = GetSurgeryResultsByDoctor(doctor.asmensKodas, surgeryResults);

        for (const result of doctorResults) {
          counter = CountSurgeryRate(counter, result);
        }

        counter = AddLowRate(counter);

        const rodiklis = DivRateBySurgeryCount(counter);

        ratedDoctors.push({
          ...doctor,
          rodiklis,
          operacijuSkaicius: doctorResults.length,
          atlikoNorimoTipoOperacija: DidSurgeryType,
        });
      }

      sortedDoctors = SortByRate(ratedDoctors);

    } else {
      sortedDoctors = SortByExperience(withTypeDoctors);
    }
  }

  const doctors = SelectBestDoctors(sortedDoctors);

  const assignedDoctor = doctors[0] ?? null;

  return { surgeryType: Type, doctors, assignedDoctor };
}
