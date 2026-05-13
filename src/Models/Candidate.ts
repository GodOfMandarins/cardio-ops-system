export type CandidateState = "aktyvus" | "rezervuotas" | "atmestas";

export interface CandidateListItem {
  id: number;
  prioritetinisRodiklis: number;
  busena: CandidateState;
  pacientas: string;
}

export async function deleteCandidateList(
  kandidatasId: number
): Promise<"success"> {
  const { deleteCandidateList: deleteCandidateListRepository } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return deleteCandidateListRepository(kandidatasId);
}

export async function rejectCandidate(
  kandidatasId: number
): Promise<"candidateRejected"> {
  const { rejectCandidate: rejectCandidateRepository } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return rejectCandidateRepository(kandidatasId);
}
