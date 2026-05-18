import {
  submitExaminationResults as windowSubmitExaminationResults,
  type LaboratoryApiWindowResult,
} from "@/src/Employee/view/LaboratoryApiWindow";
import type { ExaminationListItem } from "@/src/Models/Test";
import { fetchDueExaminationsWithoutResults } from "@/src/Shared/repositories/TestRepository";
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

function isDateInFuture(dateString: string): boolean {
  const examDate = new Date(dateString);
  const today = new Date();
  examDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return examDate.getTime() > today.getTime();
}

export async function submitDueExaminationsNow(): Promise<{ enqueued: number }> {
  // Manual update flow:
  // 1) rasti tinkamus pagal datą tyrimus be rezultatų
  // 2) enque'inti juos tokią tvarka, kokia anksčiau buvo įkelta
  // 3) apdoroti ir pateikti rezultatus
  try {
    const dueExams = await fetchDueExaminationsWithoutResults();

    // Ensure ordering by date (earliest first) and id for determinism
    dueExams.sort((a, b) => {
      const da = new Date(a.data).getTime();
      const db = new Date(b.data).getTime();
      if (da !== db) return da - db;
      return a.id - b.id;
    });

    let enqueued = 0;
    for (const exam of dueExams) {
      if (!examinationResultsQueue.find((q) => q.id === exam.id) && !(exam.data && isDateInFuture(exam.data))) {
        examinationResultsQueue.push(exam);
        enqueued++;
      }
    }

    // Process immediately
    await checkExaminationsQueue();

    return { enqueued };
  } catch (err) {
    console.error("Error submitting due examinations:", err);
    return { enqueued: 0 };
  }
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
  if (examination.data && isDateInFuture(examination.data)) {
    throw new Error(
      "Negalima pateikti tyrimų rezultatų už ateities datą. Patikrinkite tyrimo datą."
    );
  }

  // 1) Gauti tyrimo rezultatus iš laboratorijos
  const { examinationResults } = await windowSubmitExaminationResults(examination);

  // 2) Jei nėra rezultatų, nekurti įrašo ir grįžti
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
