import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  DoctorPatientListItem,
  ExaminationFormData,
  ExaminationListItem,
} from "@/src/Models/Test";
import type { DoctorPatientsListItem } from "@/src/Models/Employee";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface DoctorPatientRow extends RowDataPacket {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
}

interface DoctorPatientCodeRow extends RowDataPacket {
  patientCode: string;
}

export async function fetchDoctorPatientCodes(
  gydytojas: string
): Promise<DoctorPatientsListItem[]> {
  const rows = await queryRows<DoctorPatientCodeRow[]>(
    `SELECT DISTINCT pacientas AS patientCode
      FROM vizitas
      WHERE gydytojas = ?
      ORDER BY pacientas`,
    [gydytojas]
  );

  return rows.map((row) => ({ patientCode: row.patientCode }));
}

export async function fetchDoctorPatients(
  gydytojas: string
): Promise<DoctorPatientListItem[]> {
  const rows = await queryRows<DoctorPatientRow[]>(
    `SELECT DISTINCT
        n.asmens_kodas AS asmensKodas,
        n.vardas AS vardas,
        n.pavarde AS pavarde
      FROM vizitas v
      INNER JOIN pacientas p ON p.asmens_kodas = v.pacientas
      INNER JOIN naudotojas n ON n.asmens_kodas = p.asmens_kodas
      WHERE v.gydytojas = ?
      ORDER BY n.vardas, n.pavarde`,
    [gydytojas]
  );

  return rows.map((row) => ({
    asmensKodas: row.asmensKodas,
    vardas: row.vardas,
    pavarde: row.pavarde,
  }));
}

export async function createExamination(
  data: ExaminationFormData
): Promise<ExaminationListItem> {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tyrimas (tipas, data, kabinetas, busena, pacientas)
       VALUES (?, ?, ?, 'užregistruotas', ?)`,
      [data.tipas, data.data, data.kabinetas, data.pacientas]
    );

    return {
      id: result.insertId,
      ...data,
      busena: "uzregistruotas",
    };
  });
}

interface ExaminationRow extends RowDataPacket {
  id: number;
  tipas: string;
  data: string;
  kabinetas: number;
  pacientas: string;
  busena: string;
}

export async function fetchDueExaminationsWithoutResults(): Promise<ExaminationListItem[]> {
  const rows = await queryRows<ExaminationRow[]>(
    `SELECT t.id, t.tipas, t.data, t.kabinetas, t.pacientas, t.busena
     FROM tyrimas t
     LEFT JOIN tyrimo_rezultatai tr ON tr.tyrimas_id = t.id
     WHERE DATE(t.data) <= CURDATE()
       AND tr.id IS NULL
    ORDER BY t.data ASC, t.id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    tipas: row.tipas as any,
    data: String(row.data).split("T")[0],
    kabinetas: row.kabinetas,
    pacientas: row.pacientas,
    busena: row.busena as any,
  }));
}
