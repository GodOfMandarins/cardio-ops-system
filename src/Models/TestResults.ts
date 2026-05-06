export type TestResultsEvaluation = "gerai" | "vidutiniškai" | "blogai";

export interface TestResultsFormData {
  rodiklis: number;
  rodiklis_min: number;
  rodiklis_max: number;
  vertinimas: TestResultsEvaluation;
  data: string;
  tyrimas_id: number;
  laboratorija_id: number;
}

export interface TestResultsListItem extends TestResultsFormData {
  id: number;
}

export interface ExaminationResultsListItem extends TestResultsListItem {
  tyrimoTipas: string;
  pacientoKodas: string;
  pacientoVardas: string;
  pacientoPavarde: string;
  laboratorija: string;
}

export async function getResults(
  patientCode?: string
): Promise<ExaminationResultsListItem[]> {
  const { fetchExaminationResults } = await import(
    "@/src/Shared/repositories/TestResultsRepository"
  );
  return fetchExaminationResults(patientCode);
}

export async function submitExaminationResultsData(
  data: TestResultsFormData
): Promise<TestResultsListItem> {
  const { createTestResults } = await import(
    "@/src/Shared/repositories/TestResultsRepository"
  );
  return createTestResults(data);
}
