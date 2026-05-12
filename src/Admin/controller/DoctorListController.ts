import type {
  DoctorListItem,
  RecommendedDoctorListItem,
} from "@/src/Models/Employee";
import type { SurgeryListItem } from "@/src/Models/Surgery";
import {
  GetSurgeryResultsByDoctor,
  type SurgeryResultListItem,
} from "@/src/Models/SurgeryResults";

export interface DoctorListResult {
  surgeryType: string;
  doctors: RecommendedDoctorListItem[];
}

interface RateCounter {
  totalRate: number;
  surgeryCount: number;
}

export function CheckSurgeryType(surgery: Pick<SurgeryListItem, "tipas">): string {
  return surgery.tipas;
}

export function TakeAllDoctors(doctors: DoctorListItem[]): DoctorListItem[] {
  return doctors;
}

export function PickDoctorsBySurgeryType(
  surgeryType: string,
  doctors: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): DoctorListItem[] {
  const doctorIds = new Set(
    surgeryResults
      .filter((result) => result.operacijosTipas === surgeryType)
      .map((result) => result.gydytojasId)
  );

  return doctors.filter((doctor) => doctorIds.has(doctor.asmensKodas));
}

export function GetDoctorsList(
  surgery: Pick<SurgeryListItem, "tipas">,
  doctorsList: DoctorListItem[],
  surgeryResults: SurgeryResultListItem[]
): DoctorListResult {
  const Type = CheckSurgeryType(surgery);
  const doctorsBySurgeryType = PickDoctorsBySurgeryType(
    Type,
    doctorsList,
    surgeryResults
  );

  if (doctorsBySurgeryType.length > 3) {
    const doctors = rateDoctors(
      doctorsBySurgeryType,
      Type,
      surgeryResults,
      false
    );
    return {
      surgeryType: Type,
      doctors: SelectBestDoctors(SortByRate(doctors)),
    };
  }

  const allDoctors = TakeAllDoctors(doctorsList);

  if (allDoctors.length > 3) {
    const withTypeDoctors = PickDoctorsBySurgeryType(
      Type,
      doctorsList,
      surgeryResults
    );
    const doctors = rateDoctors(
      allDoctors,
      Type,
      surgeryResults,
      true,
      withTypeDoctors
    );

    return {
      surgeryType: Type,
      doctors: SelectBestDoctors(SortByRate(doctors)),
    };
  }

  return {
    surgeryType: Type,
    doctors: SelectBestDoctors(SortByExperience(allDoctors)),
  };
}

function rateDoctors(
  doctors: DoctorListItem[],
  surgeryType: string,
  allSurgeryResults: SurgeryResultListItem[],
  addTypeRate: boolean,
  withTypeDoctors: DoctorListItem[] = doctors
): RecommendedDoctorListItem[] {
  const doctorsWithType = new Set(
    withTypeDoctors.map((doctor) => doctor.asmensKodas)
  );

  return doctors.map((doctor) => {
    let counter: RateCounter = { totalRate: 0, surgeryCount: 0 };
    const DidSurgeryType = doctorsWithType.has(doctor.asmensKodas);

    if (addTypeRate && DidSurgeryType) {
      counter = AddRate(counter);
    }

    const surgeryResults = GetSurgeryResultsByDoctor(
      doctor.asmensKodas,
      allSurgeryResults
    );

    surgeryResults.forEach((surgeryResult) => {
      counter = CountSurgeryRate(counter, surgeryResult);
    });

    counter = AddLowRate(counter);
    const rodiklis = DivRateBySurgeryCount(counter);

    return {
      ...doctor,
      rodiklis,
      operacijuSkaicius: surgeryResults.length,
      atlikoNorimoTipoOperacija:
        DidSurgeryType ||
        surgeryResults.some(
          (surgeryResult) => surgeryResult.operacijosTipas === surgeryType
        ),
    };
  });
}

export function CountSurgeryRate(
  counter: RateCounter,
  surgeryResult: SurgeryResultListItem
): RateCounter {
  const patientStabilityRate = surgeryResult.pacientoStabilumas;
  const complicationsRate = 6 - surgeryResult.komplikacijuSunkumas;
  const painRate = 6 - surgeryResult.skausmoLygis;

  return {
    totalRate:
      counter.totalRate +
      (patientStabilityRate + complicationsRate + painRate) / 3,
    surgeryCount: counter.surgeryCount + 1,
  };
}

export function AddLowRate(counter: RateCounter): RateCounter {
  return {
    totalRate: counter.totalRate + 1,
    surgeryCount: counter.surgeryCount,
  };
}

export function DivRateBySurgeryCount(counter: RateCounter): number {
  return Number((counter.totalRate / (counter.surgeryCount + 1)).toFixed(2));
}

export function AddRate(counter: RateCounter): RateCounter {
  return {
    ...counter,
    totalRate: counter.totalRate + 0.5,
  };
}

export function SortByRate(
  doctors: RecommendedDoctorListItem[]
): RecommendedDoctorListItem[] {
  return [...doctors].sort((first, second) => {
    if (second.rodiklis !== first.rodiklis) {
      return second.rodiklis - first.rodiklis;
    }

    return second.patirtiesMetai - first.patirtiesMetai;
  });
}

export function SortByExperience(
  doctors: DoctorListItem[]
): RecommendedDoctorListItem[] {
  return [...doctors]
    .sort((first, second) => second.patirtiesMetai - first.patirtiesMetai)
    .map((doctor) => ({
      ...doctor,
      rodiklis: 0,
      operacijuSkaicius: 0,
      atlikoNorimoTipoOperacija: false,
    }));
}

export function SelectBestDoctors(
  doctors: RecommendedDoctorListItem[]
): RecommendedDoctorListItem[] {
  return doctors.slice(0, 3);
}
