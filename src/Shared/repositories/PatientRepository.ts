import { RowDataPacket } from "mysql2/promise";
import type { PatientListItem } from "@/src/Models/Patient";
import { queryRows } from "@/src/Shared/db/mysql";

interface PatientRow extends RowDataPacket {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  kraujoGrupe: string;
  ugisCm: number;
  svorisKg: number;
  amzius: number;
}

export async function fetchPatientsByCodes(
  patientCodes: string[]
): Promise<PatientListItem[]> {
  if (patientCodes.length === 0) {
    return [];
  }

  const rows = await queryRows<PatientRow[]>(
    `SELECT
        n.asmens_kodas AS asmensKodas,
        n.vardas AS vardas,
        n.pavarde AS pavarde,
        p.kraujo_grupe AS kraujoGrupe,
        p.ugis_cm AS ugisCm,
        p.svoris_kg AS svorisKg,
        p.amzius AS amzius
      FROM pacientas p
      INNER JOIN naudotojas n ON n.asmens_kodas = p.asmens_kodas
      WHERE p.asmens_kodas IN (?)
      ORDER BY n.vardas, n.pavarde`,
    [patientCodes]
  );

  return rows.map((row) => ({
    asmensKodas: row.asmensKodas,
    vardas: row.vardas,
    pavarde: row.pavarde,
    kraujoGrupe: row.kraujoGrupe,
    ugisCm: row.ugisCm,
    svorisKg: row.svorisKg,
    amzius: row.amzius,
  }));
}
