import { RowDataPacket } from "mysql2/promise";
import type { SurgeryListItem } from "@/src/Models/Surgery";
import { queryRows } from "@/src/Shared/db/mysql";

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
      FROM Operacija
      ORDER BY data ASC, pradzios_laikas ASC, id ASC`
  );

  return rows.map((row) => ({
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
  }));
}
