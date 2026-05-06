import {
  type DoctorPatientListItem,
  saveExaminationData,
  type ExaminationFormData,
  type ExaminationListItem,
} from "@/src/Models/Test";
import { addExaminationToResultsQueue } from "@/src/Employee/controller/ExaminationResultListController";
import { fetchDoctorPatients } from "@/src/Shared/repositories/TestRepository";

const DEMO_DOCTOR_ID = "11111111111";

const ALLOWED_TYPES = new Set<ExaminationFormData["tipas"]>([
  "Elektrofiziologinis tyrimas",
  "Vaizdinis tyrimas",
  "Laboratorinis tyrimas",
]);

export interface ExaminationFormDialog {
  dialog: ExaminationFormData;
  doctorPatients: DoctorPatientListItem[];
}

export interface SubmitExaminationDataResult {
  savedExamination: ExaminationListItem;
  successMessage: string;
}

export async function initiateFormOpening(
  gydytojas: string = DEMO_DOCTOR_ID
): Promise<ExaminationFormDialog> {
  const doctorPatients = await fetchDoctorPatients(gydytojas);

  return {
    dialog: {
      tipas: "Laboratorinis tyrimas",
      data: new Date().toISOString().split("T")[0],
      kabinetas: 1,
      pacientas: doctorPatients[0]?.asmensKodas ?? "",
    },
    doctorPatients,
  };
}

export function validateData(
  data: ExaminationFormData,
  doctorPatients: DoctorPatientListItem[]
): void {
  if (!ALLOWED_TYPES.has(data.tipas)) {
    throw new Error("Pasirinktas tyrimo tipas yra neteisingas.");
  }

  if (!data.data || isNaN(new Date(data.data).getTime())) {
    throw new Error("Tyrimo data yra neteisinga.");
  }

  if (!Number.isInteger(data.kabinetas) || data.kabinetas < 1) {
    throw new Error("Kabinetas turi buti teigiamas sveikas skaicius.");
  }

  if (
    !doctorPatients.some((patient) => patient.asmensKodas === data.pacientas)
  ) {
    throw new Error("Pasirinktas pacientas nepriklauso sio gydytojo pacientams.");
  }
}

export async function submitExaminationData(
  payload: unknown,
  gydytojas: string = DEMO_DOCTOR_ID
): Promise<SubmitExaminationDataResult> {
  const formData = (payload ?? {}) as ExaminationFormData;
  const doctorPatients = await fetchDoctorPatients(gydytojas);
  validateData(formData, doctorPatients);

  const savedExamination = await saveExaminationData(formData);
  addExaminationToResultsQueue(savedExamination);

  return {
    savedExamination,
    successMessage: "success message",
  };
}
