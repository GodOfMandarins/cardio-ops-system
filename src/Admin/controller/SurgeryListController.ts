import {
  GetDoctorsList as GetDoctorsListFromDoctorList,
  type DoctorListResult,
} from "@/src/Admin/controller/DoctorListController";
import type {
  DoctorListItem,
  RecommendedDoctorListItem,
} from "@/src/Models/Employee";
import type { SurgeryListItem } from "@/src/Models/Surgery";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";

export interface RecommendedDoctorAssignmentResult extends DoctorListResult {
  assignedDoctor: RecommendedDoctorListItem | null;
}

export function GetDoctorsList(
  surgery: Pick<SurgeryListItem, "tipas">,
  doctorsList: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): DoctorListResult {
  return GetDoctorsListFromDoctorList(surgery, doctorsList, surgeryResults);
}

export function RecommendDoctorByStatistics(
  surgery: Pick<SurgeryListItem, "tipas">,
  doctorsList: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): RecommendedDoctorAssignmentResult {
  const result = GetDoctorsList(surgery, doctorsList, surgeryResults);
  const assignedDoctor = result.doctors[0] ?? null;

  return {
    ...result,
    assignedDoctor,
  };
}
