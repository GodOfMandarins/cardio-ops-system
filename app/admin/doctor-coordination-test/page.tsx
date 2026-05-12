"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RecommendDoctorByStatistics } from "@/src/Admin/controller/SurgeryListController";
import type {
  EmployeeListItem,
  RecommendedDoctorListItem,
} from "@/src/Models/Employee";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";

type DemoSurgery = {
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
};

type DemoSurgeryResult = DemoSurgery & {
  doctorIndex: number;
  pacientoStabilumas: number;
  komplikacijuSunkumas: number;
  skausmoLygis: number;
};

type DoctorForTest = {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  elPastas: string;
  telNr: string | null;
  patirtiesMetai: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type RecommendationResult = {
  surgeryType: string;
  doctors: RecommendedDoctorListItem[];
};

const DEMO_SURGERIES: DemoSurgery[] = [
  {
    id: 9001,
    tipas: "Revaskuliarizacine operacija",
    prioritetas: "2",
    data: "2026-05-18",
    pradziosLaikas: "08:00",
    trukmeMin: 120,
    busena: "uzregistruotas",
    sudetingumas: "3",
    pacientas: "00000000000",
    operacineNr: 1,
  },
  {
    id: 9002,
    tipas: "Voztuvu operacija",
    prioritetas: "3",
    data: "2026-05-19",
    pradziosLaikas: "10:00",
    trukmeMin: 150,
    busena: "uzregistruotas",
    sudetingumas: "4",
    pacientas: "00000000000",
    operacineNr: 2,
  },
  {
    id: 9003,
    tipas: "Ritmo chirurgija",
    prioritetas: "1",
    data: "2026-05-20",
    pradziosLaikas: "12:00",
    trukmeMin: 90,
    busena: "uzregistruotas",
    sudetingumas: "2",
    pacientas: "00000000000",
    operacineNr: 3,
  },
];

// TEMP: visi operaciju rezultatai laikomi tik siame faile ir nerasomi i DB.
const DEMO_SURGERY_RESULTS: DemoSurgeryResult[] = [
  {
    id: 8001,
    tipas: "Revaskuliarizacine operacija",
    prioritetas: "2",
    data: "2026-04-01",
    pradziosLaikas: "08:00",
    trukmeMin: 110,
    busena: "atliktas",
    sudetingumas: "3",
    pacientas: "00000000000",
    operacineNr: 1,
    doctorIndex: 0,
    pacientoStabilumas: 5,
    komplikacijuSunkumas: 1,
    skausmoLygis: 1,
  },
  {
    id: 8002,
    tipas: "Revaskuliarizacine operacija",
    prioritetas: "3",
    data: "2026-04-03",
    pradziosLaikas: "10:00",
    trukmeMin: 130,
    busena: "atliktas",
    sudetingumas: "4",
    pacientas: "00000000000",
    operacineNr: 2,
    doctorIndex: 1,
    pacientoStabilumas: 3,
    komplikacijuSunkumas: 3,
    skausmoLygis: 2,
  },
  {
    id: 8003,
    tipas: "Voztuvu operacija",
    prioritetas: "2",
    data: "2026-04-05",
    pradziosLaikas: "09:00",
    trukmeMin: 150,
    busena: "atliktas",
    sudetingumas: "4",
    pacientas: "00000000000",
    operacineNr: 3,
    doctorIndex: 2,
    pacientoStabilumas: 5,
    komplikacijuSunkumas: 2,
    skausmoLygis: 2,
  },
  {
    id: 8004,
    tipas: "Ritmo chirurgija",
    prioritetas: "1",
    data: "2026-04-07",
    pradziosLaikas: "11:00",
    trukmeMin: 90,
    busena: "atliktas",
    sudetingumas: "2",
    pacientas: "00000000000",
    operacineNr: 4,
    doctorIndex: 3,
    pacientoStabilumas: 4,
    komplikacijuSunkumas: 1,
    skausmoLygis: 1,
  },
  {
    id: 8005,
    tipas: "Perikardo chirurgija",
    prioritetas: "4",
    data: "2026-04-09",
    pradziosLaikas: "13:00",
    trukmeMin: 80,
    busena: "atliktas",
    sudetingumas: "2",
    pacientas: "00000000000",
    operacineNr: 5,
    doctorIndex: 0,
    pacientoStabilumas: 2,
    komplikacijuSunkumas: 4,
    skausmoLygis: 4,
  },
];

export default function DoctorCoordinationTestPage() {
  const [doctors, setDoctors] = useState<DoctorForTest[]>([]);
  const [error, setError] = useState("");
  const [assignedDoctors, setAssignedDoctors] = useState<
    Record<number, RecommendedDoctorListItem>
  >({});
  const [recommendations, setRecommendations] = useState<
    Record<number, RecommendationResult>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctors() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/EmployeeListWindow", {
          cache: "no-store",
        });
        const payload = (await response.json()) as ApiResponse<EmployeeListItem[]>;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Nepavyko gauti gydytoju is DB.");
        }

        setDoctors(
          payload.data
            .filter((employee) => employee.role === "gydytojas")
            .map((employee) => ({
              asmensKodas: employee.asmensKodas,
              vardas: employee.vardas,
              pavarde: employee.pavarde,
              elPastas: employee.elPastas,
              telNr: employee.telNr,
              patirtiesMetai: employee.patirtiesMetai,
            }))
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nepavyko gauti gydytoju is DB."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDoctors();
  }, []);

  const completedResults = useMemo(
    () =>
      DEMO_SURGERY_RESULTS.map((result) => {
        const doctor = doctors[result.doctorIndex % doctors.length];

        return {
          ...result,
          doctor,
        };
      }),
    [doctors]
  );

  const surgeryResults = useMemo<SurgeryResultListItem[]>(
    () =>
      DEMO_SURGERY_RESULTS.flatMap((result) => {
        const doctor = doctors[result.doctorIndex % doctors.length];

        if (!doctor) {
          return [];
        }

        return {
          id: result.id,
          pacientoStabilumas: result.pacientoStabilumas,
          komplikacijuSunkumas: result.komplikacijuSunkumas,
          skausmoLygis: result.skausmoLygis,
          operacijaId: result.id,
          operacijosTipas: result.tipas,
          gydytojasId: doctor.asmensKodas,
        };
      }),
    [doctors]
  );

  function assignRecommendedDoctor(surgery: DemoSurgery): void {
    const result = RecommendDoctorByStatistics(
      surgery,
      doctors,
      surgeryResults
    );
    const assignedDoctor = result.assignedDoctor;

    setRecommendations((current) => ({
      ...current,
      [surgery.id]: result,
    }));

    if (assignedDoctor) {
      setAssignedDoctors((current) => ({
        ...current,
        [surgery.id]: assignedDoctor,
      }));
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
      <div className="mb-5">
        <Link
          href="/admin"
          className="rounded-xl border border-border-soft bg-white/80 px-5 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
        >
          Grizti i administratoriaus langa
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Testinis langas
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Suderinti gydytojus
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/65">
              Gydytojai imami is DB, o testines operacijos, rezultatai ir
              priskyrimai laikomi tik sio puslapio busenoje. Po refresh niekas
              nebus priskirta.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
                  Gydytojai is DB
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Darbuotojas + naudotojas
                </h2>
              </div>
              <p className="text-sm text-foreground/60">
                {isLoading ? "Kraunama" : `${doctors.length} gydytojai`}
              </p>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="px-4 py-3 text-left font-semibold">
                      Asmens kodas
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Gydytojas
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Patirtis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-foreground/65"
                      >
                        DB lenteleje darbuotojas nera gydytoju.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr
                        key={doctor.asmensKodas}
                        className="border-b border-border-soft/50"
                      >
                        <td className="px-4 py-4 font-medium">
                          {doctor.asmensKodas}
                        </td>
                        <td className="px-4 py-4">
                          {doctor.vardas} {doctor.pavarde}
                        </td>
                        <td className="px-4 py-4">
                          {doctor.patirtiesMetai} m.
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
                  Operaciju rezultatai
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Statistika rekomendacijai
                </h2>
              </div>
              <p className="text-sm text-foreground/60">
                {completedResults.length} rezultatai
              </p>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="px-4 py-3 text-left font-semibold">
                      Operacija
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Gydytojas
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Rezultatai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {completedResults.map((result) => (
                    <tr
                      key={`${result.id}-${result.doctorIndex}`}
                      className="border-b border-border-soft/50"
                    >
                      <td className="px-4 py-4">
                        #{result.id} {result.tipas}
                        <span className="block text-xs text-foreground/55">
                          {result.data}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {result.doctor
                          ? `${result.doctor.vardas} ${result.doctor.pavarde}`
                          : "Nera gydytojo"}
                        <span className="block text-xs text-foreground/55">
                          {result.doctor?.asmensKodas ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        stabilumas {result.pacientoStabilumas}, komplikacijos{" "}
                        {result.komplikacijuSunkumas}, skausmas{" "}
                        {result.skausmoLygis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-border-soft">
                <th className="px-4 py-3 text-left font-semibold">Operacija</th>
                <th className="px-4 py-3 text-left font-semibold">Tipas</th>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Busena</th>
                <th className="px-4 py-3 text-left font-semibold">Priskirta</th>
                <th className="px-4 py-3 text-left font-semibold">Saka</th>
                <th className="px-4 py-3 text-left font-semibold">Veiksmas</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_SURGERIES.map((surgery) => {
                const assignedDoctor = assignedDoctors[surgery.id];
                const recommendation = recommendations[surgery.id];

                return (
                  <tr
                    key={surgery.id}
                    className="border-b border-border-soft/50 transition hover:bg-background/30"
                  >
                    <td className="px-4 py-4 font-medium">#{surgery.id}</td>
                    <td className="px-4 py-4">{surgery.tipas}</td>
                    <td className="px-4 py-4">
                      {surgery.data} {surgery.pradziosLaikas}
                    </td>
                    <td className="px-4 py-4">{surgery.busena}</td>
                    <td className="px-4 py-4">
                      {assignedDoctor
                        ? `${assignedDoctor.vardas} ${assignedDoctor.pavarde} (${assignedDoctor.asmensKodas})`
                        : "Nepriskirta"}
                      {recommendation ? (
                        <span className="block text-xs text-foreground/55">
                          rodiklis {assignedDoctor?.rodiklis ?? "-"}, atrinkta{" "}
                          {recommendation.doctors.length}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      {recommendation
                        ? recommendation.doctors
                            .map((doctor) => doctor.asmensKodas)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => assignRecommendedDoctor(surgery)}
                        disabled={doctors.length === 0}
                        className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Rekomenduoti ir priskirti
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
