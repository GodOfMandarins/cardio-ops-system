export interface SurgeryResultListItem {
  id: number;
  pacientoStabilumas: number;
  komplikacijuSunkumas: number;
  skausmoLygis: number;
  operacijaId: number;
  operacijosTipas: string;
  gydytojasId: string;
}

export function GetSurgeryResultsByDoctor(
  doctorId: string,
  surgeryResults: SurgeryResultListItem[]
): SurgeryResultListItem[] {
  return surgeryResults.filter(
    (surgeryResult) => surgeryResult.gydytojasId === doctorId
  );
}
