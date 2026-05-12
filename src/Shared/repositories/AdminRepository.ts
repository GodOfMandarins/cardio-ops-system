import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  EmployeeFormData,
  EmployeeListItem,
} from "@/src/Models/Employee";
import type {
  OperatingRoomFormData,
  OperatingRoomListItem,
} from "@/src/Models/OperatingRoom";
import type {
  OrganFormData,
  OrganListItem,
} from "@/src/Models/Organ";
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
      FROM darbuotojas d
      INNER JOIN naudotojas n ON n.asmens_kodas = d.asmens_kodas
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
      "SELECT asmens_kodas FROM naudotojas WHERE asmens_kodas = ? OR elPastas = ? LIMIT 1",
      [data.asmensKodas, data.elPastas]
    );

    if (existingRows.length > 0) {
      throw new Error("Naudotojas su tokiu asmens kodu arba el. pastu jau egzistuoja.");
    }

    await connection.query(
      `INSERT INTO naudotojas
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
      `INSERT INTO darbuotojas
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
      FROM operacine
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
      `INSERT INTO operacine (atliekamos_operacijos_tipas)
       VALUES (?)`,
      [data.atliekamosOperacijosTipas]
    );

    return {
      nr: result.insertId,
      atliekamosOperacijosTipas: data.atliekamosOperacijosTipas,
    };
  });
}

interface OrganRow extends RowDataPacket {
  id: number;
  tipas: OrganListItem["tipas"];
  kraujoGrupe: OrganListItem["kraujoGrupe"];
  gavimoData: string;
  busena: OrganListItem["busena"];
  donoroAmzius: number;
}

export async function fetchOrgans(): Promise<OrganListItem[]> {
  const rows = await queryRows<OrganRow[]>(
    `SELECT
        id AS id,
        tipas AS tipas,
        kraujo_grupe AS kraujoGrupe,
        gavimo_data AS gavimoData,
        busena AS busena,
        donoro_amzius AS donoroAmzius
      FROM organas
      ORDER BY id DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    tipas: row.tipas,
    kraujoGrupe: row.kraujoGrupe,
    gavimoData: (row.gavimoData as unknown) instanceof Date
      ? (row.gavimoData as unknown as Date).toISOString().split("T")[0]
      : String(row.gavimoData).split("T")[0],
    busena: row.busena,
    donoroAmzius: row.donoroAmzius,
  }));
}

export async function createOrgan(
  data: OrganFormData
): Promise<OrganListItem> {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO organas (tipas, kraujo_grupe, gavimo_data, busena, donoro_amzius)
       VALUES (?, ?, ?, 'laisvas', ?)`,
      [data.tipas, data.kraujoGrupe, data.gavimoData, data.donoroAmzius]
    );

    return {
      id: result.insertId,
      tipas: data.tipas,
      kraujoGrupe: data.kraujoGrupe,
      gavimoData: data.gavimoData,
      busena: "laisvas",
      donoroAmzius: data.donoroAmzius,
    };
  });
}
