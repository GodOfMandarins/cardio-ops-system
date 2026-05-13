"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { OrganFormData, OrganListItem } from "@/src/Models/Organ";

const ORGAN_TYPES = ["širdis"] as const;
const BLOOD_TYPES = ["0", "A", "B", "AB"] as const;

interface OrganRegistrationWindowOpening {
  showOrganRegistrationWindow: true;
}

interface OrganRegistrationWindowProps {
  opening: OrganRegistrationWindowOpening;
  openingSequence: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OrganRegistrationSubmitResult {
  organ: OrganListItem;
  showNewOrganFillDialog: boolean;
}

export default function OrganRegistrationWindow({
  opening,
  openingSequence,
}: OrganRegistrationWindowProps) {
  const [organs, setOrgans] = useState<OrganListItem[]>([]);
  const [formData, setFormData] = useState<OrganFormData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);

  const requestOrganRegistrationForm = useCallback(async function requestOrganRegistrationForm({
    clearMessage,
  }: {
    clearMessage: boolean;
  }): Promise<void> {
    setIsFormLoading(true);
    setError("");

    if (clearMessage) {
      setMessage("");
    }

    try {
      const response = await fetch(
        "/api/admin/OrganRegistrationWindow?action=requestOrganRegistrationForm",
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<OrganFormData>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko gauti organo formos.");
      }

      setFormData(payload.data);
    } catch (formError) {
      setFormData(null);
      setError(
        formError instanceof Error
          ? formError.message
          : "Nepavyko gauti organo formos."
      );
    } finally {
      setIsFormLoading(false);
    }
  }, []);

  const loadOrgansList = useCallback(async function loadOrgansList(): Promise<void> {
    setIsListLoading(true);
    setListError("");

    try {
      const response = await fetch(
        "/api/admin/OrganRegistrationWindow?action=loadOrgansList",
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<OrganListItem[]>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko uzkrauti organu.");
      }

      setOrgans(payload.data);
    } catch (loadError) {
      setListError(
        loadError instanceof Error ? loadError.message : "Nepavyko uzkrauti organu."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const showOrganRegistrationWindow = useCallback(
    function showOrganRegistrationWindow(): void {
      void requestOrganRegistrationForm({ clearMessage: true });
      void loadOrgansList();
    },
    [loadOrgansList, requestOrganRegistrationForm]
  );

  useEffect(() => {
    if (opening.showOrganRegistrationWindow) {
      showOrganRegistrationWindow();
    }
  }, [
    opening.showOrganRegistrationWindow,
    openingSequence,
    showOrganRegistrationWindow,
  ]);

  function updateFormData(partialData: Partial<OrganFormData>): void {
    setFormData((current) => (current ? { ...current, ...partialData } : current));
  }

  async function submitOrganData(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!formData) {
      setError("Pirma turi buti gauta organo registracijos forma.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/OrganRegistrationWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as ApiResponse<OrganRegistrationSubmitResult>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko issaugoti organo.");
      }

      setOrgans((current) => [payload.data!.organ, ...current]);
      setMessage(`Organas #${payload.data.organ.id} sekmingai uzregistruotas.`);

      if (payload.data.showNewOrganFillDialog) {
        await requestOrganRegistrationForm({ clearMessage: false });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko issaugoti organo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          Organai
        </p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Organo registracija
        </h2>
        <p className="mt-4 text-base leading-7 text-foreground/72">
          Uzregistruokite gauta organa transplantacijai.
        </p>
      </div>

      <div className="mb-6 rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <p className="mb-1 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
          Naujo organo registravimas
        </p>
        <h3 className="mb-5 mt-1 text-xl font-semibold">
          Uzpildykite organo duomenis ir pateikite
        </h3>

        {isFormLoading && !formData ? (
          <p className="mb-4 rounded-xl bg-background/80 px-4 py-3 text-sm text-foreground/65">
            Forma kraunama...
          </p>
        ) : null}

        <form onSubmit={submitOrganData}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Organo tipas
              </label>
              <select
                value={formData?.tipas ?? "širdis"}
                onChange={(event) =>
                  updateFormData({
                    tipas: event.target.value as OrganFormData["tipas"],
                  })
                }
                disabled={!formData || isFormLoading}
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent disabled:opacity-60"
              >
                {ORGAN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Kraujo grupe
              </label>
              <select
                value={formData?.kraujoGrupe ?? "0"}
                onChange={(event) =>
                  updateFormData({
                    kraujoGrupe: event.target.value as OrganFormData["kraujoGrupe"],
                  })
                }
                disabled={!formData || isFormLoading}
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent disabled:opacity-60"
              >
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Gavimo data
              </label>
              <input
                type="date"
                value={formData?.gavimoData ?? ""}
                onChange={(event) =>
                  updateFormData({ gavimoData: event.target.value })
                }
                disabled={!formData || isFormLoading}
                required
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Donoro amzius
              </label>
              <input
                type="number"
                value={formData?.donoroAmzius || ""}
                onChange={(event) =>
                  updateFormData({
                    donoroAmzius: parseInt(event.target.value, 10) || 0,
                  })
                }
                disabled={!formData || isFormLoading}
                placeholder="pvz. 45"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent disabled:opacity-60"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
F
          <div className="mt-5">
            <button
              type="submit"
              disabled={isSubmitting || isFormLoading || !formData}
              className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saugoma..." : "Issaugoti organa"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
              Organu sarasas
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Uzregistruoti organai</h3>
          </div>
          <button
            type="button"
            onClick={() => void loadOrgansList()}
            disabled={isListLoading}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold transition hover:border-accent/30 hover:bg-background disabled:cursor-not-allowed disabled:opacity-70"
          >
            Atnaujinti
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft">
                <th className="px-4 py-3 text-left font-semibold text-foreground">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Tipas</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Kraujo grupe</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Gavimo data</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Busena</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Donoro amzius</th>
              </tr>
            </thead>
            <tbody>
              {isListLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/65">
                    Kraunama...
                  </td>
                </tr>
              ) : organs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/65">
                    Organu sarasas tuscias.
                  </td>
                </tr>
              ) : (
                organs.map((organ) => (
                  <tr
                    key={organ.id}
                    className="border-b border-border-soft/50 transition hover:bg-background/30"
                  >
                    <td className="px-4 py-4 font-medium">{organ.id}</td>
                    <td className="px-4 py-4">{organ.tipas}</td>
                    <td className="px-4 py-4">{organ.kraujoGrupe}</td>
                    <td className="px-4 py-4">{organ.gavimoData}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          organ.busena === "laisvas"
                            ? "bg-emerald-50 text-emerald-700"
                            : organ.busena === "rezervuotas"
                              ? "bg-amber-50 text-amber-700"
                              : organ.busena === "laukiama"
                                ? "bg-sky-50 text-sky-700"
                                : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {organ.busena}
                      </span>
                    </td>
                    <td className="px-4 py-4">{organ.donoroAmzius}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {listError ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {listError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
