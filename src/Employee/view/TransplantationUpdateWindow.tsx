"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransplantationData } from "@/src/Models/Transplantation";
import type { TransplantationUpdateWindowOpening } from "@/src/Employee/view/TransplantationWindow";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TransplantationUpdateResult {
  updateDataSaved?: "updateDataSaved";
  errorMessage?: string;
}

interface TransplantationUpdateWindowProps {
  opening: TransplantationUpdateWindowOpening;
}

export default function TransplantationUpdateWindow({
  opening,
}: TransplantationUpdateWindowProps) {
  const [transplantationDataForm, setTransplantationDataForm] =
    useState<TransplantationData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openTransplantationData = useCallback(async function openTransplantationData(): Promise<void> {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/employee/TransplantationUpdateWindow?action=openTransplantationData&transplantacijaId=${encodeURIComponent(
          String(opening.transplantacijaId)
        )}`,
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<TransplantationData>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ??
            "Nepavyko atidaryti transplantacijos duomenu formos."
        );
      }

      setTransplantationDataForm(payload.data);
    } catch (error) {
      setTransplantationDataForm(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko atidaryti transplantacijos duomenu formos."
      );
    } finally {
      setIsLoading(false);
    }
  }, [opening.transplantacijaId]);

  useEffect(() => {
    if (opening.showTransplantationDataForm) {
      void openTransplantationData();
    }
  }, [opening.showTransplantationDataForm, openTransplantationData]);

  async function submitUpdate(action: "confirmArrival" | "confirmNoShow"): Promise<void> {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/employee/TransplantationUpdateWindow?action=${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transplantacijaId: opening.transplantacijaId }),
        }
      );
      const payload =
        (await response.json()) as ApiResponse<TransplantationUpdateResult>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko issaugoti transplantacijos atnaujinimo."
        );
      }

      if (payload.data.errorMessage) {
        setErrorMessage(payload.data.errorMessage);
        return;
      }

      if (payload.data.updateDataSaved) {
        await openTransplantationData();
        setSuccessMessage(payload.data.updateDataSaved);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko issaugoti transplantacijos atnaujinimo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmArrival(): Promise<void> {
    return submitUpdate("confirmArrival");
  }

  function confirmNoShow(): Promise<void> {
    return submitUpdate("confirmNoShow");
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          Transplantacija
        </p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Transplantacijos duomenu atnaujinimo forma
        </h2>
      </div>

      {isLoading ? (
        <p className="rounded-xl bg-white/80 px-4 py-3 text-sm text-foreground/65">
          Kraunama...
        </p>
      ) : null}

      {transplantationDataForm ? (
        <div className="grid gap-4 rounded-[1.5rem] border border-border-soft bg-white/80 p-5">
          <div className="grid gap-3 rounded-xl border border-border-soft bg-background/90 px-4 py-3 text-sm text-foreground/70 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Transplantacija
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                #{transplantationDataForm.id}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Registracijos data
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                {transplantationDataForm.registracijosData}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Busena
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                {transplantationDataForm.busena}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Organas
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                {transplantationDataForm.organas
                  ? `#${transplantationDataForm.organas.id} ${transplantationDataForm.organas.tipas}`
                  : "-"}
              </span>
              <span className="block text-xs text-foreground/55">
                {transplantationDataForm.organas?.busena ?? "-"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Kandidatas
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                {transplantationDataForm.kandidatas
                  ? `#${transplantationDataForm.kandidatas.id}`
                  : "-"}
              </span>
              <span className="block text-xs text-foreground/55">
                {transplantationDataForm.kandidatas?.busena ?? "-"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-foreground/50">
                Vieta eileje
              </span>
              <span className="mt-1 block font-semibold text-foreground">
                {transplantationDataForm.vietaEileje}
              </span>
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void confirmArrival()}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              Patvirtinti atvykima
            </button>
            <button
              type="button"
              onClick={() => void confirmNoShow()}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Patvirtinti neatvykima
            </button>
          </div>
        </div>
      ) : null}

      {!transplantationDataForm && errorMessage ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
