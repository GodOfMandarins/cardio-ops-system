import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  TransplantationListItem,
  TransplantationRegistrationFormData,
} from "@/src/Models/Transplantation";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface WaitingListCountRow extends RowDataPacket {
  total: number;
}

interface WaitingPlaceRow extends RowDataPacket {
  nextPlace: number;
}

export async function isPatientInTransplantationWaitingList(
  pacientas: string
): Promise<boolean> {
  const rows = await queryRows<WaitingListCountRow[]>(
    `SELECT COUNT(*) AS total
      FROM kandidatas
      WHERE pacientas = ? AND busena = 'aktyvus'`,
    [pacientas]
  );

  return Number(rows[0]?.total ?? 0) > 0;
}

export async function createTransplantation(
  data: TransplantationRegistrationFormData
): Promise<TransplantationListItem> {
  return withTransaction(async (connection) => {
    const [placeRows] = await connection.query<WaitingPlaceRow[]>(
      `SELECT COALESCE(MAX(vieta_eileje), 0) + 1 AS nextPlace
        FROM transplantacija
        WHERE busena = 'laukiama'`
    );
    const vietaEileje = Number(placeRows[0]?.nextPlace ?? 1);

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO transplantacija
        (registracijos_data, prioritetas, busena, vieta_eileje)
       VALUES (?, ?, 'laukiama', ?)`,
      [data.registracijosData, data.prioritetas, vietaEileje]
    );

    return {
      id: result.insertId,
      ...data,
      busena: "laukiama",
      vietaEileje,
    };
  });
}

export async function addPatientToTransplantationWaitingList(
  data: { pacientas: string; prioritetas: string }
): Promise<"success"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `INSERT INTO kandidatas (prioritetinis_rodiklis, busena, pacientas)
       VALUES (?, 'aktyvus', ?)`,
      [Number(data.prioritetas), data.pacientas]
    );
  });

  return "success";
}

export async function removePatientFromTransplantationWaitingList(
  pacientas: string
): Promise<"success"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `DELETE FROM kandidatas
       WHERE pacientas = ? AND busena = 'aktyvus'`,
      [pacientas]
    );
  });

  return "success";
}
