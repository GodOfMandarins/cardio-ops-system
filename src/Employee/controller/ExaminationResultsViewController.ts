import {
  getResults as modelGetResults,
  type ExaminationResultsListItem,
} from "@/src/Models/TestResults";

export interface ExaminationResultsDialog {
  dialog: true;
}

export interface ExaminationResultsResult {
  examinationResults: ExaminationResultsListItem[];
}

export function initiateResultsOpening(): ExaminationResultsDialog {
  return { dialog: true };
}

export async function getResults(): Promise<ExaminationResultsResult> {
  const examinationResults = await modelGetResults();
  return { examinationResults };
}
