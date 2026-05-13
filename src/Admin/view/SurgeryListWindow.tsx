"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { SurgeryListItem, SurgeryEditFormData } from "@/src/Models/Surgery";

const OPERATION_TYPES = [
  "Revaskuliarizacine operacija",
  "Voztuvu operacija",
  "Aortos ir didziuju kraujagysliu operacija",
  "Igimtu ydu korekcija",
  "Ritmo chirurgija",
  "Mechanines pagalbos ir transplantacijos operacija",
  "Rekonstrukcine operacija",
  "Sirdies naviku chirurgija",
  "Perikardo chirurgija",
  "Traumu chirurgija",
] as const;

const BUSENA_OPTIONS = [
  "uzregistruotas",
  "vykdomas",
  "atliktas",
  "atsauktas",
] as const;

const PRIORITY_OPTIONS = ["1", "2", "3", "4", "5"] as const;
const COMPLEXITY_OPTIONS = ["1", "2", "3", "4", "5"] as const;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function surgeryToFormData(surgery: SurgeryListItem): SurgeryEditFormData {
  return {
    tipas: surgery.tipas,
    prioritetas: surgery.prioritetas,
    data: surgery.data,
    pradziosLaikas: surgery.pradziosLaikas,
    trukmeMin: surgery.trukmeMin,
    busena: surgery.busena,
    sudetingumas: surgery.sudetingumas,
    operacineNr: surgery.operacineNr,
  };
}

export default function SurgeryListWindow() {
  const [surgeries, setSurgeries] = useState<SurgeryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingSurgery, setEditingSurgery] = useState<SurgeryListItem | null>(null);
  const [formData, setFormData] = useState<SurgeryEditFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [removingSurgery, setRemovingSurgery] = useState<SurgeryListItem | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");
  const removeDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void loadSurgeries();
  }, []);

  async function loadSurgeries() {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/admin/SurgeryListWindow", {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse<SurgeryListItem[]>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko gauti operaciju.");
      }

      setSurgeries(payload.data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Nepavyko gauti operaciju."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function openSurgeryEditForm(surgery: SurgeryListItem) {
    setSubmitError("");
    setSubmitMessage("");
    const response = await fetch(
      `/api/admin/SurgeryListWindow?action=initiateFormOpening&id=${surgery.id}`,
      { cache: "no-store" }
    );
    const payload = (await response.json()) as ApiResponse<{ openDialog: true; surgery: SurgeryListItem }>;

    if (!response.ok || !payload.success || !payload.data) {
      setSubmitError(payload.message ?? "Nepavyko atidaryti redagavimo lango.");
      return;
    }

    setEditingSurgery(payload.data.surgery);
    setFormData(surgeryToFormData(payload.data.surgery));
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    setEditingSurgery(null);
    setFormData(null);
    setSubmitError("");
    setSubmitMessage("");
  }

  function updateField<K extends keyof SurgeryEditFormData>(
    key: K,
    value: SurgeryEditFormData[K]
  ) {
    setFormData((current) => (current ? { ...current, [key]: value } : current));
  }

  // initiateSurgeryRemoval() — administratorius inicijuoja operacijos šalinimą
  function initiateSurgeryRemoval(surgery: SurgeryListItem) {
    setRemoveError("");
    setRemoveMessage("");
    setRemovingSurgery(surgery);
    removeDialogRef.current?.showModal();
  }

  // initiateRemovalNo() — administratorius atsisako šalinimo
  function initiateRemovalNo() {
    removeDialogRef.current?.close();
    setRemovingSurgery(null);
    setRemoveError("");
    setRemoveMessage("");
  }

  // initiateRemovalYes() — administratorius patvirtina šalinimą
  async function initiateRemovalYes() {
    if (!removingSurgery) return;
    setIsRemoving(true);
    setRemoveError("");
    setRemoveMessage("");
    try {
      const response = await fetch(
        `/api/admin/SurgeryListWindow?id=${removingSurgery.id}`,
        { method: "DELETE" }
      );
      const payload = (await response.json()) as ApiResponse<{ message: string }>;
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Nepavyko pašalinti operacijos.");
      }
      setSurgeries((current) => current.filter((s) => s.id !== removingSurgery.id));
      setRemoveMessage("Operacija sėkmingai pašalinta.");
      setTimeout(() => {
        initiateRemovalNo();
      }, 600);
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : "Nepavyko pašalinti operacijos."
      );
    } finally {
      setIsRemoving(false);
    }
  }

  // 5-6. submitEditedSurgery() — kviečiamas kai administratorius siunčia formą
  async function submitEditedSurgery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSurgery || !formData) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/admin/SurgeryListWindow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSurgery.id, ...formData }),
      });
      const payload = (await response.json()) as ApiResponse<{ message: string }>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Nepavyko atnaujinti operacijos.");
      }

      setSurgeries((current) =>
        current.map((s) =>
          s.id === editingSurgery.id ? { ...s, ...formData } : s
        )
      );
      setSubmitMessage("Operacija sekmingai atnaujinta.");

      setTimeout(() => {
        closeDialog();
      }, 600);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Nepavyko atnaujinti operacijos."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operacijos
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Operaciju vadyba
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/72">
            Peržiūrėkite ir redaguokite registruotas operacijas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSurgeries()}
          className="rounded-2xl border border-border-soft bg-white/75 px-5 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-white whitespace-nowrap"
        >
          ↻ Atnaujinti
        </button>
      </div>

      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        {loadError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border-soft">
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipas</th>
                  <th className="px-4 py-3 text-left font-semibold">Data</th>
                  <th className="px-4 py-3 text-left font-semibold">Laikas</th>
                  <th className="px-4 py-3 text-left font-semibold">Trukme</th>
                  <th className="px-4 py-3 text-left font-semibold">Busena</th>
                  <th className="px-4 py-3 text-left font-semibold">Prior.</th>
                  <th className="px-4 py-3 text-left font-semibold">Sudet.</th>
                  <th className="px-4 py-3 text-left font-semibold">Op. nr.</th>
                  <th className="px-4 py-3 text-left font-semibold">Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-foreground/65">
                      Kraunama...
                    </td>
                  </tr>
                ) : surgeries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-foreground/65">
                      Operaciju sarasas tuscias.
                    </td>
                  </tr>
                ) : (
                  surgeries.map((surgery) => (
                    <tr
                      key={surgery.id}
                      className="border-b border-border-soft/50 transition hover:bg-background/30"
                    >
                      <td className="px-4 py-4 font-medium">#{surgery.id}</td>
                      <td className="px-4 py-4">{surgery.tipas}</td>
                      <td className="px-4 py-4">{surgery.data}</td>
                      <td className="px-4 py-4">{surgery.pradziosLaikas}</td>
                      <td className="px-4 py-4">{surgery.trukmeMin} min</td>
                      <td className="px-4 py-4">{surgery.busena}</td>
                      <td className="px-4 py-4">{surgery.prioritetas}</td>
                      <td className="px-4 py-4">{surgery.sudetingumas}</td>
                      <td className="px-4 py-4">{surgery.operacineNr}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void openSurgeryEditForm(surgery)}
                            className="rounded-xl border border-border-soft px-3 py-1.5 text-xs font-semibold transition hover:border-accent/40 hover:bg-background"
                          >
                            Redaguoti
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateSurgeryRemoval(surgery)}
                            className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
                          >
                            Atsaukti
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop:bg-black/50"
      >
        <div className="w-full min-w-[360px] max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-1">
            Redaguoti operacija #{editingSurgery?.id}
          </h3>
          <p className="mb-6 text-sm text-foreground/60">
            Pacientas: {editingSurgery?.pacientas}
          </p>

          {formData ? (
            <form onSubmit={(e) => void submitEditedSurgery(e)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Tipas</label>
                <select
                  value={formData.tipas}
                  onChange={(e) => updateField("tipas", e.target.value)}
                  className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                >
                  {OPERATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => updateField("data", e.target.value)}
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Pradžios laikas</label>
                  <input
                    type="time"
                    value={formData.pradziosLaikas}
                    onChange={(e) => updateField("pradziosLaikas", e.target.value)}
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Trukmė (min)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.trukmeMin}
                  onChange={(e) =>
                    updateField("trukmeMin", parseInt(e.target.value, 10))
                  }
                  className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Prioritetas</label>
                  <select
                    value={formData.prioritetas}
                    onChange={(e) => updateField("prioritetas", e.target.value)}
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Sudėtingumas</label>
                  <select
                    value={formData.sudetingumas}
                    onChange={(e) => updateField("sudetingumas", e.target.value)}
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    {COMPLEXITY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Būsena</label>
                  <select
                    value={formData.busena}
                    onChange={(e) => updateField("busena", e.target.value)}
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    {BUSENA_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Operacinės nr.</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.operacineNr}
                    onChange={(e) =>
                      updateField("operacineNr", parseInt(e.target.value, 10))
                    }
                    className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              {submitError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </p>
              ) : null}

              {submitMessage ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {submitMessage}
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
                  className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50"
                >
                  Atsaukti
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </dialog>
      <dialog
        ref={removeDialogRef}
        className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop:bg-black/50"
      >
        <div className="w-full min-w-[320px] max-w-sm">
          <h3 className="text-xl font-semibold mb-2">Atsaukti operaciją</h3>
          <p className="mb-6 text-sm text-foreground/60">
            Ar tikrai norite pašalinti operaciją #{removingSurgery?.id}?
          </p>

          {removeError ? (
            <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {removeError}
            </p>
          ) : null}

          {removeMessage ? (
            <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {removeMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void initiateRemovalYes()}
              disabled={isRemoving}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRemoving ? "Šalinama..." : "Taip"}
            </button>
            <button
              type="button"
              onClick={initiateRemovalNo}
              disabled={isRemoving}
              className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Ne
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
