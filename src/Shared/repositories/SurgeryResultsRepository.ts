import { RowDataPacket } from "mysql2/promise";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";
import { queryRows } from "@/src/Shared/db/mysql";

interface SurgeryResultRow extends RowDataPacket {
  id: number;
  pacientoStabilumas: number;
  komplikacijuSunkumas: number;
  skausmoLygis: number;
  operacijaId: number;
  operacijosTipas: string;
  gydytojasId: string;
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

  return rows.map((row) => ({
    id: row.id,
    pacientoStabilumas: Number(row.pacientoStabilumas),
    komplikacijuSunkumas: Number(row.komplikacijuSunkumas),
    skausmoLygis: Number(row.skausmoLygis),
    operacijaId: row.operacijaId,
    operacijosTipas: row.operacijosTipas,
    gydytojasId: row.gydytojasId,
  }));
}
