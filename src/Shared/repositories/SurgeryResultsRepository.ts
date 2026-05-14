import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  SurgeryResultFormData,
  SurgeryResultListItem,
} from "@/src/Models/SurgeryResults";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface SurgeryResultRow extends RowDataPacket {
  id: number;
  pacientoStabilumas: number;
  komplikacijuSunkumas: number;
  skausmoLygis: number;
  operacijaId: number;
  operacijosTipas: string;
  gydytojasId: string;
}

function mapSurgeryResult(row: SurgeryResultRow): SurgeryResultListItem {
  return {
    id: row.id,
    pacientoStabilumas: Number(row.pacientoStabilumas),
    komplikacijuSunkumas: Number(row.komplikacijuSunkumas),
    skausmoLygis: Number(row.skausmoLygis),
    operacijaId: row.operacijaId,
    operacijosTipas: row.operacijosTipas,
    gydytojasId: row.gydytojasId,
  };
}

export async function fetchSurgeryResults(): Promise<SurgeryResultListItem[]> {
  const rows = await queryRows<SurgeryResultRow[]>(
    `SELECT
        r.id AS id,
        CAST(r.paciento_stabilumas AS UNSIGNED) AS pacientoStabilumas,
        CAST(r.komplikaciju_sunkumas AS UNSIGNED) AS komplikacijuSunkumas,
        CAST(r.skausmo_lygis AS UNSIGNED) AS skausmoLygis,
        o.id AS operacijaId,
        o.tipas AS operacijosTipas,
        og.gydytojas_id AS gydytojasId
      FROM operacijos_rezultatai r
      INNER JOIN operacija o ON o.id = r.operacija_id
      INNER JOIN operacija_gydytojas og ON og.operacija_id = o.id`
  );

  return rows.map(mapSurgeryResult);
}

export async function createSurgeryResult(
  data: SurgeryResultFormData
): Promise<SurgeryResultListItem> {
  return withTransaction(async (connection) => {
    const [existingRows] = await connection.query<RowDataPacket[]>(
      `SELECT
          o.id AS id,
          o.busena AS busena,
          r.id AS rezultatasId
        FROM operacija o
        LEFT JOIN operacijos_rezultatai r ON r.operacija_id = o.id
        WHERE o.id = ?
        LIMIT 1`,
      [data.operacijaId]
    );

    const existing = existingRows[0];
    if (!existing) {
      throw new Error("Pasirinkta operacija nerasta.");
    }

    if (existing.busena === "atliktas" || existing.rezultatasId) {
      throw new Error("Pasirinktos operacijos rezultatai jau uzregistruoti.");
    }

    const [createdResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO operacijos_rezultatai
        (paciento_stabilumas, komplikaciju_sunkumas, skausmo_lygis, operacija_id)
       VALUES (?, ?, ?, ?)`,
      [
        data.pacientoStabilumas,
        data.komplikacijuSunkumas,
        data.skausmoLygis,
        data.operacijaId,
      ]
    );

    const [updatedSurgery] = await connection.query<ResultSetHeader>(
      "UPDATE operacija SET busena = 'atliktas' WHERE id = ? AND busena <> 'atliktas'",
      [data.operacijaId]
    );

    if (updatedSurgery.affectedRows !== 1) {
      throw new Error("Pasirinkta operacija nerasta.");
    }

    const [rows] = await connection.query<SurgeryResultRow[]>(
      `SELECT
          r.id AS id,
          CAST(r.paciento_stabilumas AS UNSIGNED) AS pacientoStabilumas,
          CAST(r.komplikaciju_sunkumas AS UNSIGNED) AS komplikacijuSunkumas,
          CAST(r.skausmo_lygis AS UNSIGNED) AS skausmoLygis,
          o.id AS operacijaId,
          o.tipas AS operacijosTipas,
          og.gydytojas_id AS gydytojasId
        FROM operacijos_rezultatai r
        INNER JOIN operacija o ON o.id = r.operacija_id
        INNER JOIN operacija_gydytojas og ON og.operacija_id = o.id
        WHERE r.id = ?
        LIMIT 1`,
      [createdResult.insertId]
    );

    if (!rows[0]) {
      throw new Error("Nepavyko sukurti operacijos rezultatu iraso.");
    }

    return mapSurgeryResult(rows[0]);
  });
}
