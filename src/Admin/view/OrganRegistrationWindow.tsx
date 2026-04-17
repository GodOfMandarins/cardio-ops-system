"use client";

import { useEffect, useState } from "react";
import type { OrganFormData, OrganListItem } from "@/src/Models/Organ";

const ORGAN_TYPES = ["sirdis"] as const;
const BLOOD_TYPES = ["0", "A", "B", "AB"] as const;

function makeInitialForm(): OrganFormData {
  return {
    tipas: "sirdis",
    kraujoGrupe: "0",
    gavimoData: new Date().toISOString().split("T")[0],
    donoroAmzius: 0,
  };
}

export default function OrganRegistrationWindow() {
  const [organs, setOrgans] = useState<OrganListItem[]>([]);
  const [formData, setFormData] = useState<OrganFormData>(makeInitialForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void initiateOrganRegistrationWindowOpening();
  }, []);

  // 4: requestOrganRegistrationForm → grąžina formą
  async function requestOrganRegistrationForm() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/OrganRegistrationWindow", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: OrganListItem[];
        message?: string;
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Nepavyko uzkrauti organu.");
      }
      setOrgans(payload.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Nepavyko uzkrauti organu."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // 2-3: initiateOrganRegistrationWindowOpening → showOrganRegistrationWindow
  async function initiateOrganRegistrationWindowOpening() {
    await requestOrganRegistrationForm();
  }

  // 7-9: submitOrganData → validateData → saveOrganData
  async function submitOrganData(event: { preventDefault: () => void }) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/OrganRegistrationWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: { organ: OrganListItem; showNewOrganFillDialog: boolean };
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        // 11-12: error message
        throw new Error(payload.message ?? "Nepavyko issaugoti organo.");
      }

      // 10: success — pridedame į sąrašą, reset forma (loop tęsiasi)
      setOrgans((current) => [payload.data!.organ, ...current]);
      setMessage("Organas sekmingai uzregistruotas.");
      setFormData(makeInitialForm());
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
          Užregistruokite gautą organą transplantacijai.
        </p>
      </div>

      {/* FORMA VIRŠUJE */}
      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5 mb-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase mb-1">
          Naujo organo registravimas
        </p>
        <h3 className="mt-1 text-xl font-semibold mb-5">
          Užpildykite organo duomenis ir pateikite
        </h3>

        <form onSubmit={submitOrganData}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Organo tipas
              </label>
              <select
                value={formData.tipas}
                onChange={(e) =>
                  setFormData((c) => ({ ...c, tipas: e.target.value as OrganFormData["tipas"] }))
                }
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              >
                {ORGAN_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Kraujo grupė
              </label>
              <select
                value={formData.kraujoGrupe}
                onChange={(e) =>
                  setFormData((c) => ({ ...c, kraujoGrupe: e.target.value as OrganFormData["kraujoGrupe"] }))
                }
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              >
                {BLOOD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Gavimo data
              </label>
              <input
                type="date"
                value={formData.gavimoData}
                onChange={(e) =>
                  setFormData((c) => ({ ...c, gavimoData: e.target.value }))
                }
                required
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Donoro amžius
              </label>
              <input
                type="number"
                value={formData.donoroAmzius || ""}
                onChange={(e) =>
                  setFormData((c) => ({ ...c, donoroAmzius: parseInt(e.target.value, 10) || 0 }))
                }
                placeholder="pvz. 45"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>
          </div>

          {/* 11-12: error message */}
          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
          ) : null}

          <div className="mt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saugoma..." : "Issaugoti organą"}
            </button>
          </div>
        </form>
      </div>

      {/* SĄRAŠAS APAČIOJE */}
      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
              Organu sarasas
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Uzregistruoti organai</h3>
          </div>
          <button
            type="button"
            onClick={() => void initiateOrganRegistrationWindowOpening()}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold transition hover:border-accent/30 hover:bg-background"
          >
            ↻ Atnaujinti
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft">
                <th className="text-left px-4 py-3 font-semibold text-foreground">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Tipas</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Kraujo grupė</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Gavimo data</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Būsena</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Donoro amžius</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/65">Kraunama...</td>
                </tr>
              ) : organs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/65">Organu sarasas tuscias.</td>
                </tr>
              ) : (
                organs.map((organ) => (
                  <tr key={organ.id} className="border-b border-border-soft/50 hover:bg-background/30 transition">
                    <td className="px-4 py-4 font-medium">{organ.id}</td>
                    <td className="px-4 py-4">{organ.tipas}</td>
                    <td className="px-4 py-4">{organ.kraujoGrupe}</td>
                    <td className="px-4 py-4">{organ.gavimoData}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        organ.busena === "laisvas" ? "bg-emerald-50 text-emerald-700"
                        : organ.busena === "rezervuota" ? "bg-amber-50 text-amber-700"
                        : organ.busena === "laukiama" ? "bg-sky-50 text-sky-700"
                        : "bg-rose-50 text-rose-700"
                      }`}>
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
      </div>
    </section>
  );
}
