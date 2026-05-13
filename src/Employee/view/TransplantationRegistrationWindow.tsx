"use client";

import { FormEvent, useState } from "react";
import type { PatientListItem } from "@/src/Models/Patient";
import type { TransplantationRegistrationFormData } from "@/src/Models/Transplantation";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TransplantationRegistrationResult {
  errorMessage?: string;
  successMessage?: string;
  alreadyRegisteredMessage?: string;
}

interface TransplantationRegistrationWindowProps {
  transplantationRegistrationForm: TransplantationRegistrationFormData;
  patient?: PatientListItem;
  onCancelRegistration: () => void;
}

const PRIORITIES = ["1", "2", "3", "4", "5"] as const;

export default function TransplantationRegistrationWindow({
  transplantationRegistrationForm,
  patient,
  onCancelRegistration,
}: TransplantationRegistrationWindowProps) {
  const [formData, setFormData] = useState<TransplantationRegistrationFormData>(
    transplantationRegistrationForm
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  async function submitTransplantationRegistrationData(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setAlreadyRegisteredMessage("");
    try {
      const response = await fetch(
        "/api/employee/TransplantationRegistrationWindow?action=submitTransplantationRegistrationData",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const payload =
        (await response.json()) as ApiResponse<TransplantationRegistrationResult>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko uzregistruoti transplantacijos."
        );
      }
      showErrorMessage(payload.data.errorMessage);
      showAlreadyRegisteredMessage(payload.data.alreadyRegisteredMessage);
      showSuccessMessage(payload.data.successMessage);
    } catch (error) {
      showErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko uzregistruoti transplantacijos."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmNewRegistration(): Promise<void> {
    setIsConfirming(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/employee/TransplantationRegistrationWindow?action=confirmNewRegistration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const payload =
        (await response.json()) as ApiResponse<TransplantationRegistrationResult>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko patvirtinti naujos registracijos."
        );
      }

      setAlreadyRegisteredMessage("");
      showSuccessMessage(payload.data.successMessage);
    } catch (error) {
      showErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepavyko patvirtinti naujos registracijos."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  function showErrorMessage(message?: string): void {
    if (message) {
      setErrorMessage(message);
    }
  }

  function showSuccessMessage(message?: string): void {
    if (message) {
      setSuccessMessage(message);
    }
  }

  function showAlreadyRegisteredMessage(message?: string): void {
    if (message) {
      setAlreadyRegisteredMessage(message);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Transplantacija
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Transplantacijos registravimo forma
          </h2>
        </div>
      </div>

      <form
        onSubmit={submitTransplantationRegistrationData}
        className="mt-8 grid gap-4 rounded-[1.5rem] border border-border-soft bg-white/80 p-5"
      >
        <div className="grid gap-3 rounded-xl border border-border-soft bg-background/90 px-4 py-3 text-sm text-foreground/70 sm:grid-cols-2">
          <div>
            <span className="block text-xs font-semibold uppercase text-foreground/50">
              Pacientas
            </span>
            <span className="mt-1 block font-semibold text-foreground">
              {patient ? `${patient.vardas} ${patient.pavarde}` : formData.pacientas}
            </span>
            <span className="block text-xs text-foreground/55">
              {formData.pacientas}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-foreground/50">
              Kraujo grupe
            </span>
            <span className="mt-1 block font-semibold text-foreground">
              {patient?.kraujoGrupe ?? "-"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-foreground/50">
              Ugis ir svoris
            </span>
            <span className="mt-1 block font-semibold text-foreground">
              {patient ? `${patient.ugisCm} cm / ${patient.svorisKg} kg` : "-"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-foreground/50">
              Amzius
            </span>
            <span className="mt-1 block font-semibold text-foreground">
              {patient?.amzius ?? "-"}
            </span>
          </div>
        </div>

        <input
          type="date"
          value={formData.registracijosData}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              registracijosData: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
        />

        <select
          value={formData.prioritetas}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              prioritetas: event.target.value as TransplantationRegistrationFormData["prioritetas"],
            }))
          }
          className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              Prioritetas {priority}
            </option>
          ))}
        </select>
        <p className="text-sm leading-6 text-foreground/65">
          Prioritetas pildomas pagal diagramoje pateikta 1-5 rodikli: 1 - blogai,
          5 - gerai. Transplantacijos busena ir vieta eileje sukuriamos sistemos.
        </p>

        {errorMessage ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {alreadyRegisteredMessage ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p>{alreadyRegisteredMessage}</p>
            <button
              type="button"
              onClick={() => void confirmNewRegistration()}
              disabled={isConfirming}
              className="mt-3 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isConfirming ? "Tvirtinama..." : "Patvirtinti nauja registravima"}
            </button>
          </div>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saugoma..." : "Issaugoti"}
          </button>
          <button
            type="button"
            onClick={onCancelRegistration}
            className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50"
          >
            Atsaukti
          </button>
        </div>
      </form>
    </section>
  );
}
