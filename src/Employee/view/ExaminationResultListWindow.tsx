"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExaminationResultsListItem } from "@/src/Models/TestResults";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ExaminationResultsResult {
  examinationResults: ExaminationResultsListItem[];
}

type SortKey = "data" | "pacientas" | "tyrimoTipas" | "vertinimas" | "rodiklis";

interface ExaminationResultListWindowProps {
  patientCode?: string;
}

export default function ExaminationResultListWindow({
  patientCode,
}: ExaminationResultListWindowProps) {
  const [results, setResults] = useState<ExaminationResultsListItem[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("data");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void openExaminationResults();
  }, [patientCode]);

  async function openExaminationResults(): Promise<void> {
    setIsLoading(true);
    setError("");

    try {
      const openingResponse = await fetch(
        "/api/employee/ExaminationResultListWindow?action=initiateResultsOpening",
        { cache: "no-store" }
      );
      const openingPayload = (await openingResponse.json()) as ApiResponse<{
        dialog: true;
      }>;

      if (!openingResponse.ok || !openingPayload.success || !openingPayload.data) {
        throw new Error(
          openingPayload.message ?? "Nepavyko atidaryti tyrimu rezultatu lango."
        );
      }

      await getResults();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti tyrimu rezultatu lango."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function getResults(): Promise<void> {
    const response = await fetch(
      `/api/employee/ExaminationResultListWindow?action=getResults${
        patientCode ? `&pacientas=${encodeURIComponent(patientCode)}` : ""
      }`,
      { cache: "no-store" }
    );
    const payload = (await response.json()) as ApiResponse<ExaminationResultsResult>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message ?? "Nepavyko gauti tyrimu rezultatu.");
    }

    setResults(payload.data.examinationResults);
  }

  const sortedResults = useMemo(() => {
    return [...results].sort((first, second) => {
      if (sortKey === "pacientas") {
        return `${first.pacientoVardas} ${first.pacientoPavarde}`.localeCompare(
          `${second.pacientoVardas} ${second.pacientoPavarde}`
        );
      }

      return String(first[sortKey]).localeCompare(String(second[sortKey]));
    });
  }, [results, sortKey]);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Tyrimu rezultatai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Perziureti tyrimu rezultatus
          </h2>
          {patientCode ? (
            <p className="mt-2 text-sm text-foreground/60">
              Rodomi paciento {patientCode} rezultatai.
            </p>
          ) : null}
        </div>
        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          className="rounded-xl border border-border-soft bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-accent"
        >
          <option value="data">Rikiuoti pagal data</option>
          <option value="pacientas">Rikiuoti pagal pacienta</option>
          <option value="tyrimoTipas">Rikiuoti pagal tyrima</option>
          <option value="vertinimas">Rikiuoti pagal vertinima</option>
          <option value="rodiklis">Rikiuoti pagal rodikli</option>
        </select>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="px-4 py-3 text-left font-semibold">Pacientas</th>
              <th className="px-4 py-3 text-left font-semibold">Tyrimas</th>
              <th className="px-4 py-3 text-left font-semibold">Rodiklis</th>
              <th className="px-4 py-3 text-left font-semibold">Norma</th>
              <th className="px-4 py-3 text-left font-semibold">Vertinimas</th>
              <th className="px-4 py-3 text-left font-semibold">Laboratorija</th>
              <th className="px-4 py-3 text-left font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/65">
                  Kraunama...
                </td>
              </tr>
            ) : sortedResults.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/65">
                  Tyrimu rezultatu nera.
                </td>
              </tr>
            ) : (
              sortedResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-border-soft/50 transition hover:bg-background/30"
                >
                  <td className="px-4 py-4 font-medium">
                    {result.pacientoVardas} {result.pacientoPavarde}
                  </td>
                  <td className="px-4 py-4">{result.tyrimoTipas}</td>
                  <td className="px-4 py-4">{result.rodiklis}</td>
                  <td className="px-4 py-4">
                    {result.rodiklis_min} - {result.rodiklis_max}
                  </td>
                  <td className="px-4 py-4">{result.vertinimas}</td>
                  <td className="px-4 py-4">{result.laboratorija}</td>
                  <td className="px-4 py-4">{result.data}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
