"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransplantationWindowListItem } from "@/src/Models/Transplantation";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface TransplantationUpdateWindowOpening {
  showTransplantationDataForm: true;
  transplantacijaId: number;
}

interface TransplantationWindowProps {
  onOpenTransplantationUpdate: (
    opening: TransplantationUpdateWindowOpening
  ) => void;
}

export default function TransplantationWindow({
  onOpenTransplantationUpdate,
}: TransplantationWindowProps) {
  const [transplantations, setTransplantations] = useState<
    TransplantationWindowListItem[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const loadTransplantationsList = useCallback(async function loadTransplantationsList(): Promise<void> {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/employee/TransplantationUpdateWindow?action=loadTransplantationsList",
        { cache: "no-store" }
      );
      const payload =
        (await response.json()) as ApiResponse<TransplantationWindowListItem[]>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko uzkrauti transplantaciju.");
      }

      setTransplantations(payload.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko uzkrauti transplantaciju."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransplantationsList();
  }, [loadTransplantationsList]);

  async function initiateTransplantationUpdate(
    transplantacijaId: number
  ): Promise<void> {
    setOpeningId(transplantacijaId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/employee/TransplantationUpdateWindow?action=initiateTransplantationUpdateWindowOpening&transplantacijaId=${encodeURIComponent(
          String(transplantacijaId)
        )}`,
        { cache: "no-store" }
      );
      const payload =
        (await response.json()) as ApiResponse<TransplantationUpdateWindowOpening>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ??
            "Nepavyko atidaryti transplantacijos atnaujinimo formos."
        );
      }

      onOpenTransplantationUpdate(payload.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko atidaryti transplantacijos atnaujinimo formos."
      );
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Transplantacija
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Transplantaciju sarasas
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void loadTransplantationsList()}
          disabled={isLoading}
          className="rounded-xl border border-border-soft px-4 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-background disabled:cursor-not-allowed disabled:opacity-70"
        >
          Atnaujinti
        </button>
      </div>

      {errorMessage ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-[1.5rem] border border-border-soft bg-white/80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">
                Registracijos data
              </th>
              <th className="px-4 py-3 text-left font-semibold">Prioritetas</th>
              <th className="px-4 py-3 text-left font-semibold">Busena</th>
              <th className="px-4 py-3 text-left font-semibold">Vieta eileje</th>
              <th className="px-4 py-3 text-left font-semibold">Organas</th>
              <th className="px-4 py-3 text-left font-semibold">Veiksmas</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/65">
                  Kraunama...
                </td>
              </tr>
            ) : transplantations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/65">
                  Transplantaciju sarasas tuscias.
                </td>
              </tr>
            ) : (
              transplantations.map((transplantation) => (
                <tr
                  key={transplantation.id}
                  className="border-b border-border-soft/50 transition hover:bg-background/30"
                >
                  <td className="px-4 py-4 font-medium">{transplantation.id}</td>
                  <td className="px-4 py-4">
                    {transplantation.registracijosData}
                  </td>
                  <td className="px-4 py-4">{transplantation.prioritetas}</td>
                  <td className="px-4 py-4">{transplantation.busena}</td>
                  <td className="px-4 py-4">{transplantation.vietaEileje}</td>
                  <td className="px-4 py-4">
                    {transplantation.organasId ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    {transplantation.organasId ? (
                      <button
                        type="button"
                        onClick={() =>
                          void initiateTransplantationUpdate(transplantation.id)
                        }
                        disabled={openingId === transplantation.id}
                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {openingId === transplantation.id
                          ? "Atidaroma..."
                          : "Atnaujinti"}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
