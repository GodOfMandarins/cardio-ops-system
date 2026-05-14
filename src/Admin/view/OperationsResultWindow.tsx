"use client";

import { FormEvent, useRef, useState } from "react";
import type { SurgeryListItem } from "@/src/Models/Surgery";
import type {
  SurgeryIndicator,
  SurgeryResultFormData,
  SurgeryResultListItem,
} from "@/src/Models/SurgeryResults";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OperationsResultListOpening {
  surgeryResults: SurgeryResultListItem[];
  surgeries: SurgeryListItem[];
}

interface OperationsResultDialog {
  dialog: true;
}

const INDICATORS: SurgeryIndicator[] = [1, 2, 3, 4, 5];

const initialForm: SurgeryResultFormData = {
  operacijaId: 0,
  pacientoStabilumas: 1,
  komplikacijuSunkumas: 1,
  skausmoLygis: 1,
};

export default function OperationsResultWindow({
  opening,
}: {
  opening: OperationsResultListOpening;
}) {
  const [surgeryResults, setSurgeryResults] = useState(opening.surgeryResults);
  const [surgeries, setSurgeries] = useState(opening.surgeries);
  const [formData, setFormData] = useState<SurgeryResultFormData>(initialForm);
  const [dialogOpening, setDialogOpening] =
    useState<OperationsResultDialog | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  async function openOperationsResultForm(): Promise<void> {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/OperationsResultWindow?action=initiateOperationsResultOpening",
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<OperationsResultDialog>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ??
            "Nepavyko atidaryti operaciju rezultatu registravimo formos."
        );
      }

      setDialogOpening(payload.data);
      setFormData(initialForm);
      dialogRef.current?.showModal();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti operaciju rezultatu registravimo formos."
      );
    }
  }

  function closeDialog(): void {
    dialogRef.current?.close();
    setDialogOpening(null);
    setFormData(initialForm);
    setError("");
  }

  async function submitOperationResultsData(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/OperationsResultWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = (await response.json()) as ApiResponse<SurgeryResultListItem>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko uzregistruoti operacijos rezultatu."
        );
      }

      const createdResult = payload.data;
      setMessage(
        payload.message ?? "Operacijos rezultatai sekmingai uzregistruoti."
      );
      setSurgeryResults((current) => [...current, createdResult]);
      setSurgeries((current) =>
        current.filter((surgery) => surgery.id !== createdResult.operacijaId)
      );
      setTimeout(() => {
        closeDialog();
      }, 600);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko uzregistruoti operacijos rezultatu."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operaciju rezultatai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Operaciju rezultatu sarasas
          </h2>
        </div>

        <button
          type="button"
          onClick={() => void openOperationsResultForm()}
          className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong"
        >
          Registruoti rezultatus
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border-soft">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Operacija</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Paciento stabilumas
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Komplikaciju sunkumas
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Skausmo lygis
                </th>
              </tr>
            </thead>
            <tbody>
              {surgeryResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-foreground/65"
                  >
                    Operaciju rezultatu nera.
                  </td>
                </tr>
              ) : (
                surgeryResults.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b border-border-soft/50 transition hover:bg-background/30"
                  >
                    <td className="px-4 py-4 font-medium">#{result.id}</td>
                    <td className="px-4 py-4">
                      #{result.operacijaId} {result.operacijosTipas}
                    </td>
                    <td className="px-4 py-4">{result.pacientoStabilumas}</td>
                    <td className="px-4 py-4">{result.komplikacijuSunkumas}</td>
                    <td className="px-4 py-4">{result.skausmoLygis}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop:bg-black/50"
      >
        {dialogOpening ? (
          <div className="w-full min-w-[360px] max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-6 text-2xl font-semibold">
              Operacijos rezultatu registravimo forma
            </h3>

            <form onSubmit={(event) => void submitOperationResultsData(event)} className="space-y-4">
              <label className="block text-sm">
                <span className="font-semibold">Operacija</span>
                <select
                  value={formData.operacijaId}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      operacijaId: Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                >
                  <option value={0}>Pasirinkite operacija</option>
                  {surgeries.map((surgery) => (
                    <option key={surgery.id} value={surgery.id}>
                      #{surgery.id} {surgery.tipas}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-semibold">Paciento stabilumas</span>
                <select
                  value={formData.pacientoStabilumas}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      pacientoStabilumas: Number(event.target.value) as SurgeryIndicator,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                >
                  {INDICATORS.map((indicator) => (
                    <option key={indicator} value={indicator}>
                      {indicator}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-semibold">Komplikaciju sunkumas</span>
                <select
                  value={formData.komplikacijuSunkumas}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      komplikacijuSunkumas: Number(event.target.value) as SurgeryIndicator,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                >
                  {INDICATORS.map((indicator) => (
                    <option key={indicator} value={indicator}>
                      {indicator}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-semibold">Skausmo lygis</span>
                <select
                  value={formData.skausmoLygis}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      skausmoLygis: Number(event.target.value) as SurgeryIndicator,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                >
                  {INDICATORS.map((indicator) => (
                    <option key={indicator} value={indicator}>
                      {indicator}
                    </option>
                  ))}
                </select>
              </label>

              {error ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saugoma..." : "Issaugoti"}
                </button>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Atsaukti
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
