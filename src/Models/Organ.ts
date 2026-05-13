export type OrganType = "širdis";
export type BloodType = "0" | "A" | "B" | "AB";
export type OrganStatus = "laisvas" | "rezervuotas";

export interface OrganFormData {
  tipas: OrganType;
  kraujoGrupe: BloodType;
  gavimoData: string;
  donoroAmzius: number;
}

export interface OrganListItem {
  id: number;
  tipas: OrganType;
  kraujoGrupe: BloodType;
  gavimoData: string;
  busena: OrganStatus;
  donoroAmzius: number;
}

export async function saveOrganData(
  data: OrganFormData
): Promise<OrganListItem> {
  const { createOrgan } = await import(
    "@/src/Shared/repositories/AdminRepository"
  );
  return createOrgan(data);
}

export async function releaseOrgan(organasId: number): Promise<"organReleased"> {
  const { releaseOrgan: releaseOrganRepository } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return releaseOrganRepository(organasId);
}
