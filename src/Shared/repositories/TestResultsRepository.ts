import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  ExaminationResultsListItem,
  TestResultsFormData,
  TestResultsListItem,
} from "@/src/Models/TestResults";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface LaboratoryRow extends RowDataPacket {
  id: number;
}

interface ExaminationResultsRow extends RowDataPacket {
  id: number;
  rodiklis: number;
  rodiklis_min: number;
  rodiklis_max: number;
  vertinimas: ExaminationResultsListItem["vertinimas"];
  data: string;
  tyrimas_id: number;
  laboratorija_id: number;
  tyrimoTipas: string;
  pacientoKodas: string;
  pacientoVardas: string;
  pacientoPavarde: string;
  laboratorija: string;
}

export async function fetchExaminationResults(
  patientCode?: string
): Promise<ExaminationResultsListItem[]> {
  const rows = await queryRows<ExaminationResultsRow[]>(
    `SELECT
        tr.id AS id,
        tr.rodiklis AS rodiklis,
        tr.rodiklis_min AS rodiklis_min,
        tr.rodiklis_max AS rodiklis_max,
        tr.vertinimas AS vertinimas,
        tr.data AS data,
        tr.tyrimas_id AS tyrimas_id,
        tr.laboratorija_id AS laboratorija_id,
        t.tipas AS tyrimoTipas,
        n.asmens_kodas AS pacientoKodas,
        n.vardas AS pacientoVardas,
        n.pavarde AS pacientoPavarde,
        l.pavadinimas AS laboratorija
      FROM tyrimo_rezultatai tr
      INNER JOIN tyrimas t ON t.id = tr.tyrimas_id
      INNER JOIN naudotojas n ON n.asmens_kodas = t.pacientas
      INNER JOIN laboratorija l ON l.id = tr.laboratorija_id
      ${patientCode ? "WHERE t.pacientas = ?" : ""}
      ORDER BY tr.data DESC, tr.id DESC`
    ,
    patientCode ? [patientCode] : []
  );

  return rows.map((row) => ({
    id: row.id,
    rodiklis: row.rodiklis,
    rodiklis_min: row.rodiklis_min,
    rodiklis_max: row.rodiklis_max,
    vertinimas: row.vertinimas,
    data: String(row.data).split("T")[0],
    tyrimas_id: row.tyrimas_id,
    laboratorija_id: row.laboratorija_id,
    tyrimoTipas: row.tyrimoTipas,
    pacientoKodas: row.pacientoKodas,
    pacientoVardas: row.pacientoVardas,
    pacientoPavarde: row.pacientoPavarde,
    laboratorija: row.laboratorija,
  }));
}

export async function getRandomLaboratoryId(): Promise<number> {
  const rows = await queryRows<LaboratoryRow[]>(
    "SELECT id FROM laboratorija ORDER BY RAND() LIMIT 1"
  );

  if (rows[0]) {
    return rows[0].id;
  }

  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO laboratorija (pavadinimas, adresas)
       VALUES ('Demo laboratorija', 'Demo adresas')`
    );

    return result.insertId;
  });
}

export async function createTestResults(
  data: TestResultsFormData
): Promise<TestResultsListItem> {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tyrimo_rezultatai
        (rodiklis, rodiklis_min, rodiklis_max, vertinimas, data, tyrimas_id, laboratorija_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.rodiklis,
        data.rodiklis_min,
        data.rodiklis_max,
        data.vertinimas,
        data.data,
        data.tyrimas_id,
        data.laboratorija_id,
      ]
    );

    return {
      id: result.insertId,
      ...data,
    };
  });
}
