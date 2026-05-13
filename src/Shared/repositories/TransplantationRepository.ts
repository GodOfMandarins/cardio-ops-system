import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  TransplantationData,
  TransplantationListItem,
  TransplantationRegistrationFormData,
  TransplantationWindowListItem,
} from "@/src/Models/Transplantation";
import type { CandidateListItem } from "@/src/Models/Candidate";
import type { OrganListItem } from "@/src/Models/Organ";
import { queryRows, withTransaction } from "@/src/Shared/db/mysql";

interface TransplantationRow extends RowDataPacket {
  id: number;
  registracijosData: string | Date;
  prioritetas: TransplantationWindowListItem["prioritetas"];
  busena: TransplantationWindowListItem["busena"];
  vietaEileje: number;
  organasId: number | null;
}

interface WaitingListCountRow extends RowDataPacket {
  total: number;
}

interface WaitingPlaceRow extends RowDataPacket {
  nextPlace: number;
}

interface TransplantationDataRow extends TransplantationRow {
  organasTipas: OrganListItem["tipas"] | null;
  organasKraujoGrupe: OrganListItem["kraujoGrupe"] | null;
  organasGavimoData: string | Date | null;
  organasBusena: OrganListItem["busena"] | null;
  organasDonoroAmzius: number | null;
  kandidatasId: number | null;
  kandidatasPrioritetinisRodiklis: number | null;
  kandidatasBusena: CandidateListItem["busena"] | null;
  kandidatasPacientas: string | null;
}

function formatDate(value: string | Date | null): string {
  if (!value) {
    return "";
  }

  return value instanceof Date
    ? value.toISOString().split("T")[0]
    : String(value).split("T")[0];
}

function mapTransplantationRow(
  row: TransplantationRow
): TransplantationWindowListItem {
  return {
    id: row.id,
    registracijosData: formatDate(row.registracijosData),
    prioritetas: row.prioritetas,
    busena: row.busena,
    vietaEileje: row.vietaEileje,
    organasId: row.organasId,
  };
}

export async function fetchTransplantations(): Promise<
  TransplantationWindowListItem[]
> {
  const rows = await queryRows<TransplantationRow[]>(
    `SELECT
        id AS id,
        registracijos_data AS registracijosData,
        prioritetas AS prioritetas,
        busena AS busena,
        vieta_eileje AS vietaEileje,
        organas_id AS organasId
      FROM transplantacija
      ORDER BY id DESC`
  );

  return rows.map(mapTransplantationRow);
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

export async function getTransplantationData(
  transplantacijaId: number
): Promise<TransplantationData> {
  const rows = await queryRows<TransplantationDataRow[]>(
    `SELECT
        t.id AS id,
        t.registracijos_data AS registracijosData,
        t.prioritetas AS prioritetas,
        t.busena AS busena,
        t.vieta_eileje AS vietaEileje,
        t.organas_id AS organasId,
        o.tipas AS organasTipas,
        o.kraujo_grupe AS organasKraujoGrupe,
        o.gavimo_data AS organasGavimoData,
        o.busena AS organasBusena,
        o.donoro_amzius AS organasDonoroAmzius,
        k.id AS kandidatasId,
        k.prioritetinis_rodiklis AS kandidatasPrioritetinisRodiklis,
        k.busena AS kandidatasBusena,
        k.pacientas AS kandidatasPacientas
      FROM transplantacija t
      LEFT JOIN organas o ON o.id = t.organas_id
      LEFT JOIN kandidatas_organas ko ON ko.organas_id = o.id
      LEFT JOIN kandidatas k ON k.id = ko.kandidatas_id
      WHERE t.id = ?
      ORDER BY
        CASE k.busena
          WHEN 'rezervuotas' THEN 0
          WHEN 'aktyvus' THEN 1
          ELSE 2
        END
      LIMIT 1`,
    [transplantacijaId]
  );

  const row = rows[0];

  if (!row) {
    throw new Error("Transplantacijos duomenys nerasti.");
  }

  return {
    ...mapTransplantationRow(row),
    organas: row.organasId
      ? {
          id: row.organasId,
          tipas: row.organasTipas!,
          kraujoGrupe: row.organasKraujoGrupe!,
          gavimoData: formatDate(row.organasGavimoData),
          busena: row.organasBusena!,
          donoroAmzius: Number(row.organasDonoroAmzius),
        }
      : null,
    kandidatas: row.kandidatasId
      ? {
          id: row.kandidatasId,
          prioritetinisRodiklis: Number(row.kandidatasPrioritetinisRodiklis),
          busena: row.kandidatasBusena!,
          pacientas: row.kandidatasPacientas ?? "",
        }
      : null,
  };
}

export async function markTransplantationAsCompleted(
  transplantacijaId: number
): Promise<"transplantationCompleted"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `UPDATE transplantacija
       SET busena = 'įvyko'
       WHERE id = ?`,
      [transplantacijaId]
    );
  });

  return "transplantationCompleted";
}

export async function markTransplantationAsFailed(
  transplantacijaId: number
): Promise<"transplantationFailed"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `UPDATE transplantacija
       SET busena = 'nevyko'
       WHERE id = ?`,
      [transplantacijaId]
    );
  });

  return "transplantationFailed";
}

export async function releaseOrgan(organasId: number): Promise<"organReleased"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `UPDATE organas
       SET busena = 'laisvas'
       WHERE id = ?`,
      [organasId]
    );
  });

  return "organReleased";
}

export async function rejectCandidate(
  kandidatasId: number
): Promise<"candidateRejected"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `UPDATE kandidatas
       SET busena = 'atmestas'
       WHERE id = ?`,
      [kandidatasId]
    );
  });

  return "candidateRejected";
}

export async function deleteCandidateList(
  kandidatasId: number
): Promise<"success"> {
  await withTransaction(async (connection) => {
    await connection.query<ResultSetHeader>(
      `DELETE FROM kandidatas
       WHERE id = ?`,
      [kandidatasId]
    );
  });

  return "success";
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
