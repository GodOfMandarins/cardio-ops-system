import type { ExaminationListItem } from "@/src/Models/Test";
import type { TestResultsFormData } from "@/src/Models/TestResults";
import { getRandomLaboratoryId } from "@/src/Shared/repositories/TestResultsRepository";

export interface LaboratoryApiWindowResult {
  examinationResults: TestResultsFormData[];
}

function randomFloat(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getEvaluation(
  rodiklis: number,
  rodiklis_min: number,
  rodiklis_max: number
): TestResultsFormData["vertinimas"] {
  if (rodiklis < rodiklis_min || rodiklis > rodiklis_max) {
    return "blogai";
  }

  const range = rodiklis_max - rodiklis_min;
  const nearMin = rodiklis - rodiklis_min < range * 0.15;
  const nearMax = rodiklis_max - rodiklis < range * 0.15;

  return nearMin || nearMax ? "vidutiniškai" : "gerai";
}

function createFakeExaminationResult(
  examination: ExaminationListItem,
  laboratorija_id: number
): TestResultsFormData {
  const rodiklis_min = randomFloat(2, 4);
  const rodiklis_max = randomFloat(7, 10);
  const rodiklis = randomFloat(rodiklis_min - 1.5, rodiklis_max + 1.5);

  return {
    rodiklis,
    rodiklis_min,
    rodiklis_max,
    vertinimas: getEvaluation(rodiklis, rodiklis_min, rodiklis_max),
    data: new Date().toISOString().split("T")[0],
    tyrimas_id: examination.id,
    laboratorija_id,
  };
}

export async function submitExaminationResults(
  examination: ExaminationListItem
): Promise<LaboratoryApiWindowResult> {
  const laboratoryId = await getRandomLaboratoryId();
  const examinationResults = [createFakeExaminationResult(examination, laboratoryId),];
  //const examinationResults: TestResultsFormData[] = [];

  return { examinationResults };
}
