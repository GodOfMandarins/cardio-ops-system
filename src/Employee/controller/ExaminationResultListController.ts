import {
  submitExaminationResults as windowSubmitExaminationResults,
  type LaboratoryApiWindowResult,
} from "@/src/Employee/view/LaboratoryApiWindow";
import type { ExaminationListItem } from "@/src/Models/Test";
import {
  submitExaminationResultsData,
  getResults as modelGetResults,
  type ExaminationResultsListItem,
  type TestResultsListItem,
} from "@/src/Models/TestResults";

export interface ExaminationResultsAddedResult {
  examinationResults: LaboratoryApiWindowResult["examinationResults"];
  examinationResultsAdded: TestResultsListItem[];
}

export interface ExaminationResultsDialog {
  dialog: true;
}

export interface ExaminationResultsResult {
  examinationResults: ExaminationResultsListItem[];
}

export function initiateResultsOpening(): ExaminationResultsDialog {
  return { dialog: true };
}

export async function getResults(
  patientCode?: string
): Promise<ExaminationResultsResult> {
  const examinationResults = await modelGetResults(patientCode);
  return { examinationResults };
}

const examinationResultsQueue: ExaminationListItem[] = [];
let isCheckingExaminations = false;

export function addExaminationToResultsQueue(examination: ExaminationListItem): void {
  examinationResultsQueue.push(examination);
  void checkExaminationsQueue();
}

export async function checkExaminationsQueue(): Promise<void> {
  if (isCheckingExaminations) {
    return;
  }

  isCheckingExaminations = true;

  try {
    while (examinationResultsQueue.length > 0) {
      const examination = examinationResultsQueue.shift();

      if (examination) {
        try {
          await submitExaminationResults(examination);
        } catch {
          // Foninis rezultatu pateikimas neturi sustabdyti tyrimu paskyrimo.
        }
      }
    }
  } finally {
    isCheckingExaminations = false;
  }
}

export async function submitExaminationResults(
  examination: ExaminationListItem
): Promise<ExaminationResultsAddedResult> {
  const { examinationResults } = await windowSubmitExaminationResults(examination);

  if (examinationResults.length === 0) {
    return {
      examinationResults,
      examinationResultsAdded: [],
    };
  }

  const examinationResultsAdded = await Promise.all(
    examinationResults.map((result) => submitExaminationResultsData(result))
  );

  return {
    examinationResults,
    examinationResultsAdded,
  };
}
