import { RowDataPacket } from "mysql2/promise";
import type { SurgeryRoomUsageItem } from "@/src/Models/SurgeryRoom";
import { queryRows } from "@/src/Shared/db/mysql";

interface SurgeryRoomUsageRow extends RowDataPacket {
  nr: number;
  atliekamosOperacijosTipas: string;
  operacijaId: number | null;
  tipas: string | null;
  data: string | null;
  pradziosLaikas: string | null;
  trukmeMin: number | null;
  busena: string | null;
  pacientas: string | null;
}

export async function fetchOperatingRoomsUsage(): Promise<SurgeryRoomUsageItem[]> {
  const rows = await queryRows<SurgeryRoomUsageRow[]>(
    `SELECT
        o.nr AS nr,
        o.atliekamos_operacijos_tipas AS atliekamosOperacijosTipas,
        op.id AS operacijaId,
        op.tipas AS tipas,
        DATE_FORMAT(op.data, '%Y-%m-%d') AS data,
        TIME_FORMAT(op.pradzios_laikas, '%H:%i') AS pradziosLaikas,
        op.trukme_min AS trukmeMin,
        op.busena AS busena,
        op.pacientas AS pacientas
      FROM operacine o
      LEFT JOIN operacija op ON op.operacine_nr = o.nr
      ORDER BY o.nr ASC, op.data ASC, op.pradzios_laikas ASC, op.id ASC`
  );

  const rooms = new Map<number, SurgeryRoomUsageItem>();

  rows.forEach((row) => {
    const room =
      rooms.get(row.nr) ??
      {
        nr: row.nr,
        atliekamosOperacijosTipas: row.atliekamosOperacijosTipas,
        operacijos: [],
      };

    if (row.operacijaId && row.tipas && row.data && row.pradziosLaikas) {
      room.operacijos.push({
        id: row.operacijaId,
        tipas: row.tipas,
        data: row.data,
        pradziosLaikas: row.pradziosLaikas,
        trukmeMin: Number(row.trukmeMin ?? 0),
        busena: row.busena ?? "",
        pacientas: row.pacientas ?? "",
        operacineNr: row.nr,
      });
    }

    rooms.set(row.nr, room);
  });

  return [...rooms.values()];
}
