import {
  saveTransplantationData as saveTransplantationDataEntity,
  type TransplantationListItem,
  type TransplantationPriority,
  type TransplantationRegistrationFormData,
} from "@/src/Models/Transplantation";
import {
  addPatientToWaitingList as addPatientToWaitingListEntity,
  checkIfPatientAlreadyRegistered as checkIfPatientAlreadyRegisteredEntity,
  removePatientFromWaitingList as removePatientFromWaitingListEntity,
} from "@/src/Models/Patient";

const PRIORITIES = new Set<TransplantationPriority>([
  "1",
  "2",
  "3",
  "4",
  "5",
]);

export interface TransplantationRegistrationWindowOpening {
  transplantationRegistrationForm: TransplantationRegistrationFormData;
}

export interface TransplantationRegistrationResult {
  transplantation?: TransplantationListItem;
  errorMessage?: string;
  successMessage?: string;
  alreadyRegisteredMessage?: string;
}

export function initiateTransplantationRegistrationWindowOpening(
  pacientas: string
): TransplantationRegistrationWindowOpening {
  return showTransplantationRegistrationWindow(pacientas);
}

export function showTransplantationRegistrationWindow(
  pacientas: string
): TransplantationRegistrationWindowOpening {
  return {
    transplantationRegistrationForm: {
      registracijosData: new Date().toISOString().split("T")[0],
      prioritetas: "1",
      pacientas,
    },
  };
}

export function validateData(
  data: TransplantationRegistrationFormData
): void {
  if (!data.pacientas || data.pacientas.trim().length !== 11) {
    throw new Error("Paciento asmens kodas yra neteisingas.");
  }

  if (!data.registracijosData || isNaN(new Date(data.registracijosData).getTime())) {
    throw new Error("Transplantacijos registracijos data yra neteisinga.");
  }

  if (!PRIORITIES.has(data.prioritetas)) {
    throw new Error("Transplantacijos prioritetas yra neteisingas.");
  }
}

export function showErrorMessage(errorMessage: string): TransplantationRegistrationResult {
  return { errorMessage };
}

export async function checkIfPatientAlreadyRegistered(
  pacientas: string
): Promise<boolean> {
  return checkIfPatientAlreadyRegisteredEntity(pacientas);
}

export async function saveTransplantationData(
  data: TransplantationRegistrationFormData
): Promise<TransplantationListItem> {
  return saveTransplantationDataEntity(data);
}

export async function addPatientToWaitingList(
  data: TransplantationRegistrationFormData
): Promise<"success"> {
  return addPatientToWaitingListEntity(data);
}

export async function removePatientFromWaitingList(
  pacientas: string
): Promise<"success"> {
  return removePatientFromWaitingListEntity(pacientas);
}

export function showSuccessMessage(
  transplantation: TransplantationListItem
): TransplantationRegistrationResult {
  return {
    transplantation,
    successMessage: "successMessage",
  };
}

export function showAlreadyRegisteredMessage(): TransplantationRegistrationResult {
  return {
    alreadyRegisteredMessage:
      "Pacientas jau yra transplantacijos eileje. Gydytojas gali patvirtinti nauja registravima arba atnaujinima.",
  };
}

export async function submitTransplantationRegistrationData(
  payload: unknown
): Promise<TransplantationRegistrationResult> {
  const formData = (payload ?? {}) as TransplantationRegistrationFormData;

  try {
    validateData(formData);
  } catch (error) {
    return showErrorMessage(
      error instanceof Error
        ? error.message
        : "Transplantacijos registracijos duomenys yra neteisingi."
    );
  }

  const patientAlreadyRegistered = await checkIfPatientAlreadyRegistered(
    formData.pacientas
  );

  if (patientAlreadyRegistered) {
    return showAlreadyRegisteredMessage();
  }

  const transplantation = await saveTransplantationData(formData);
  await addPatientToWaitingList(formData);

  return showSuccessMessage(transplantation);
}

export async function confirmNewRegistration(
  payload: unknown
): Promise<TransplantationRegistrationResult> {
  const formData = (payload ?? {}) as TransplantationRegistrationFormData;
  validateData(formData);

  await removePatientFromWaitingList(formData.pacientas);
  const transplantation = await saveTransplantationData(formData);
  await addPatientToWaitingList(formData);

  return showSuccessMessage(transplantation);
}
