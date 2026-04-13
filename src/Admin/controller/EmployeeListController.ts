import {
  type EmployeeFormData,
  submitEmployeeData as modelSubmitEmployeeData,
} from "@/src/Models/Employee";
import { fetchEmployees } from "@/src/Shared/repositories/AdminRepository";

export async function initiateEmployeeFormOpening() {
  return fetchEmployees();
}

export function validateData(data: EmployeeFormData): void {
  if (!/^\d{11}$/.test(data.asmensKodas)) {
    throw new Error("Asmens kodas turi sudaryti 11 skaiciu.");
  }

  if (!data.vardas || !data.pavarde) {
    throw new Error("Vardas ir pavarde yra privalomi.");
  }

  if (!data.elPastas.includes("@")) {
    throw new Error("Nurodykite teisinga el. pasta.");
  }

  if (data.slaptazodis.length < 4) {
    throw new Error("Slaptazodis turi buti bent 4 simboliu.");
  }

  if (
    data.role !== "gydytojas" &&
    data.role !== "administratorius" &&
    data.role !== "laboratorijos darbuotojas"
  ) {
    throw new Error("Pasirinkta role yra neteisinga.");
  }

  if (!Number.isInteger(data.patirtiesMetai) || data.patirtiesMetai < 0) {
    throw new Error("Patirties metai turi buti teigiamas sveikas skaicius.");
  }
}

export async function submitEmployeeData(payload: unknown) {
  const formData = (payload ?? {}) as EmployeeFormData;
  validateData(formData);
  return modelSubmitEmployeeData(formData);
}
