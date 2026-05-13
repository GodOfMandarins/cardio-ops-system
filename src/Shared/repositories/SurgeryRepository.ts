import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  PlannedSurgeryListItem,
  SurgeryEditFormData,
  SurgeryDoctorAssignment,
  SurgeryListItem,
  SurgerySubmissionData,
} from "@/src/Models/Surgery";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface SurgeryRow extends RowDataPacket {
  id: number;
  tipas: string;
  prioritetas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  sudetingumas: string;
  pacientas: string;
  operacineNr: number;
}

interface PlannedSurgeryRow extends SurgeryRow {
  gydytojuSkaicius: number;
}

interface SurgeryDoctorAssignmentRow extends RowDataPacket {
  operacijaId: number;
  gydytojasId: string;
}

function mapSurgery(row: SurgeryRow): SurgeryListItem {
  return {
    id: row.id,
    tipas: row.tipas,
    prioritetas: row.prioritetas,
    data: row.data,
    pradziosLaikas: row.pradziosLaikas,
    trukmeMin: row.trukmeMin,
    busena: row.busena,
    sudetingumas: row.sudetingumas,
    pacientas: row.pacientas,
    operacineNr: row.operacineNr,
  };
}

export async function fetchSurgeryById(id: number): Promise<SurgeryListItem | null> {
  const rows = await queryRows<SurgeryRow[]>(
    `SELECT
        id AS id,
        tipas AS tipas,
        prioritetas AS prioritetas,
        DATE_FORMAT(data, '%Y-%m-%d') AS data,
        TIME_FORMAT(pradzios_laikas, '%H:%i') AS pradziosLaikas,
        trukme_min AS trukmeMin,
        busena AS busena,
        sudetingumas AS sudetingumas,
        pacientas AS pacientas,
        operacine_nr AS operacineNr
      FROM operacija
      WHERE id = ?`,
    [id]
  );
  return rows[0] ? mapSurgery(rows[0]) : null;
}

export async function fetchSurgeries(): Promise<SurgeryListItem[]> {
  const rows = await queryRows<SurgeryRow[]>(
    `SELECT
        id AS id,
        tipas AS tipas,
        prioritetas AS prioritetas,
        DATE_FORMAT(data, '%Y-%m-%d') AS data,
        TIME_FORMAT(pradzios_laikas, '%H:%i') AS pradziosLaikas,
        trukme_min AS trukmeMin,
        busena AS busena,
        sudetingumas AS sudetingumas,
        pacientas AS pacientas,
        operacine_nr AS operacineNr
      FROM operacija
      ORDER BY data ASC, pradzios_laikas ASC, id ASC`
  );

  return rows.map(mapSurgery);
}

export async function fetchPlannedSurgeries(): Promise<PlannedSurgeryListItem[]> {
  const rows = await queryRows<PlannedSurgeryRow[]>(
    `SELECT
        o.id AS id,
        o.tipas AS tipas,
        o.prioritetas AS prioritetas,
        DATE_FORMAT(o.data, '%Y-%m-%d') AS data,
        TIME_FORMAT(o.pradzios_laikas, '%H:%i') AS pradziosLaikas,
        o.trukme_min AS trukmeMin,
        o.busena AS busena,
        o.sudetingumas AS sudetingumas,
        o.pacientas AS pacientas,
        o.operacine_nr AS operacineNr,
        COUNT(og.gydytojas_id) AS gydytojuSkaicius
      FROM operacija o
      LEFT JOIN operacija_gydytojas og ON og.operacija_id = o.id
      WHERE o.busena <> 'atliktas'
      GROUP BY
        o.id,
        o.tipas,
        o.prioritetas,
        o.data,
        o.pradzios_laikas,
        o.trukme_min,
        o.busena,
        o.sudetingumas,
        o.pacientas,
        o.operacine_nr
      ORDER BY o.data ASC, o.pradzios_laikas ASC, o.id ASC`
  );

  return rows.map((row) => ({
    ...mapSurgery(row),
    gydytojuSkaicius: Number(row.gydytojuSkaicius),
  }));
}

export async function updateSurgery(
  id: number,
  data: SurgeryEditFormData
): Promise<void> {
  await withTransaction(async (connection) => {
    await connection.query(
      `UPDATE operacija SET
        tipas = ?,
        prioritetas = ?,
        data = ?,
        pradzios_laikas = ?,
        trukme_min = ?,
        busena = ?,
        sudetingumas = ?,
        operacine_nr = ?
      WHERE id = ?`,
      [
        data.tipas,
        data.prioritetas,
        data.data,
        data.pradziosLaikas,
        data.trukmeMin,
        data.busena,
        data.sudetingumas,
        data.operacineNr,
        id,
      ]
    );
  });
}

export async function removeSurgery(id: number): Promise<void> {
  await withTransaction(async (connection) => {
    await connection.query(`DELETE FROM operacija WHERE id = ?`, [id]);
  });
}

export async function fetchSurgeryDoctorAssignments(): Promise<
  SurgeryDoctorAssignment[]
> {
  const rows = await queryRows<SurgeryDoctorAssignmentRow[]>(
    `SELECT
        operacija_id AS operacijaId,
        gydytojas_id AS gydytojasId
      FROM operacija_gydytojas`
  );

  return rows.map((row) => ({
    operacijaId: row.operacijaId,
    gydytojasId: row.gydytojasId,
  }));
}

export async function saveSurgery(
  data: SurgerySubmissionData
): Promise<SurgeryListItem> {
  return withTransaction(async (connection) => {
    if (data.perkeliamaOperacijaId) {
      await connection.query(
        `UPDATE operacija
         SET tipas = ?,
             prioritetas = ?,
             data = ?,
             pradzios_laikas = ?,
             trukme_min = ?,
             sudetingumas = ?,
             pacientas = ?,
             operacine_nr = ?
         WHERE id = ?`,
        [
          data.tipas,
          data.prioritetas,
          data.selectedTime.data,
          data.selectedTime.pradziosLaikas,
          data.trukmeMin,
          data.sudetingumas,
          data.pacientas,
          data.selectedTime.operacineNr,
          data.perkeliamaOperacijaId,
        ]
      );

      await connection.query(
        "DELETE FROM operacija_gydytojas WHERE operacija_id = ?",
        [data.perkeliamaOperacijaId]
      );
      await connection.query(
        `INSERT INTO operacija_gydytojas (operacija_id, gydytojas_id)
         VALUES (?, ?)`,
        [data.perkeliamaOperacijaId, data.gydytojasId]
      );

      return {
        id: data.perkeliamaOperacijaId,
        tipas: data.tipas,
        prioritetas: data.prioritetas,
        data: data.selectedTime.data,
        pradziosLaikas: data.selectedTime.pradziosLaikas,
        trukmeMin: data.trukmeMin,
        busena: "užregistruotas",
        sudetingumas: data.sudetingumas,
        pacientas: data.pacientas,
        operacineNr: data.selectedTime.operacineNr,
      };
    }

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO operacija
        (tipas, prioritetas, data, pradzios_laikas, trukme_min, busena, sudetingumas, pacientas, operacine_nr)
       VALUES (?, ?, ?, ?, ?, 'užregistruotas', ?, ?, ?)`,
      [
        data.tipas,
        data.prioritetas,
        data.selectedTime.data,
        data.selectedTime.pradziosLaikas,
        data.trukmeMin,
        data.sudetingumas,
        data.pacientas,
        data.selectedTime.operacineNr,
      ]
    );

    await connection.query(
      `INSERT INTO operacija_gydytojas (operacija_id, gydytojas_id)
       VALUES (?, ?)`,
      [result.insertId, data.gydytojasId]
    );

    return {
      id: result.insertId,
      tipas: data.tipas,
      prioritetas: data.prioritetas,
      data: data.selectedTime.data,
      pradziosLaikas: data.selectedTime.pradziosLaikas,
      trukmeMin: data.trukmeMin,
      busena: "užregistruotas",
      sudetingumas: data.sudetingumas,
      pacientas: data.pacientas,
      operacineNr: data.selectedTime.operacineNr,
    };
  });
}
