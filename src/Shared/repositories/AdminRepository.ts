import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  EmployeeFormData,
  EmployeeListItem,
} from "@/src/Models/Employee";
import type {
  OperatingRoomFormData,
  OperatingRoomListItem,
} from "@/src/Models/OperatingRoom";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface EmployeeRow extends RowDataPacket {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  elPastas: string;
  telNr: string | null;
  role: EmployeeListItem["role"];
  patirtiesMetai: number;
}

interface OperatingRoomRow extends RowDataPacket {
  nr: number;
  atliekamosOperacijosTipas: OperatingRoomListItem["atliekamosOperacijosTipas"];
}

export async function fetchEmployees(): Promise<EmployeeListItem[]> {
  const rows = await queryRows<EmployeeRow[]>(
    `SELECT
        n.asmens_kodas AS asmensKodas,
        n.vardas AS vardas,
        n.pavarde AS pavarde,
        n.elPastas AS elPastas,
        n.tel_nr AS telNr,
        d.role AS role,
        d.patirties_metai AS patirtiesMetai
      FROM Darbuotojas d
      INNER JOIN Naudotojas n ON n.asmens_kodas = d.asmens_kodas
      ORDER BY n.vardas, n.pavarde`
  );

  return rows.map((row) => ({
    asmensKodas: row.asmensKodas,
    vardas: row.vardas,
    pavarde: row.pavarde,
    elPastas: row.elPastas,
    telNr: row.telNr,
    role: row.role,
    patirtiesMetai: row.patirtiesMetai,
  }));
}

export async function createEmployee(
  data: EmployeeFormData
): Promise<EmployeeListItem> {
  return withTransaction(async (connection) => {
    const [existingRows] = await connection.query<RowDataPacket[]>(
      "SELECT asmens_kodas FROM Naudotojas WHERE asmens_kodas = ? OR elPastas = ? LIMIT 1",
      [data.asmensKodas, data.elPastas]
    );

    if (existingRows.length > 0) {
      throw new Error("Naudotojas su tokiu asmens kodu arba el. pastu jau egzistuoja.");
    }

    await connection.query(
      `INSERT INTO Naudotojas
        (asmens_kodas, vardas, pavarde, elPastas, slaptazodis, tel_nr)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.asmensKodas,
        data.vardas,
        data.pavarde,
        data.elPastas,
        data.slaptazodis,
        data.telNr || null,
      ]
    );

    await connection.query(
      `INSERT INTO Darbuotojas
        (asmens_kodas, role, patirties_metai)
       VALUES (?, ?, ?)`,
      [data.asmensKodas, data.role, data.patirtiesMetai]
    );

    return {
      asmensKodas: data.asmensKodas,
      vardas: data.vardas,
      pavarde: data.pavarde,
      elPastas: data.elPastas,
      telNr: data.telNr || null,
      role: data.role,
      patirtiesMetai: data.patirtiesMetai,
    };
  });
}

export async function fetchOperatingRooms(): Promise<OperatingRoomListItem[]> {
  const rows = await queryRows<OperatingRoomRow[]>(
    `SELECT
        nr AS nr,
        atliekamos_operacijos_tipas AS atliekamosOperacijosTipas
      FROM Operacine
      ORDER BY nr DESC`
  );

  return rows.map((row) => ({
    nr: row.nr,
    atliekamosOperacijosTipas: row.atliekamosOperacijosTipas,
  }));
}

export async function createOperatingRoom(
  data: OperatingRoomFormData
): Promise<OperatingRoomListItem> {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO Operacine (atliekamos_operacijos_tipas)
       VALUES (?)`,
      [data.atliekamosOperacijosTipas]
    );

    return {
      nr: result.insertId,
      atliekamosOperacijosTipas: data.atliekamosOperacijosTipas,
    };
  });
}
