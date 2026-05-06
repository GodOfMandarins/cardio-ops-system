"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  EmployeeFormData,
  EmployeeListItem,
} from "@/src/Models/Employee";

const initialForm: EmployeeFormData = {
  asmensKodas: "",
  vardas: "",
  pavarde: "",
  elPastas: "",
  slaptazodis: "",
  telNr: "",
  role: "gydytojas",
  patirtiesMetai: 0,
};

export default function EmployeeListWindow() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [formData, setFormData] = useState<EmployeeFormData>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void openEmployeeList();
  }, []);

  function openEmployeeList(): void {
    void loadEmployees();
  }

  async function loadEmployees() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/EmployeeListWindow", { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        data?: EmployeeListItem[];
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Nepavyko uzkrauti darbuotoju.");
      }

      setEmployees(payload.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nepavyko uzkrauti darbuotoju."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openEmployeeForm() {
    setFormData(initialForm);
    setMessage("");
    setError("");
    dialogRef.current?.showModal();
  }

  const handleCloseDialog = () => {
    dialogRef.current?.close();
    setFormData(initialForm);
    setMessage("");
    setError("");
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/EmployeeListWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          patirtiesMetai: Number(formData.patirtiesMetai),
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: EmployeeListItem;
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko issaugoti darbuotojo.");
      }

      const createdEmployee = payload.data;
      setEmployees((current) => [createdEmployee, ...current]);
      setMessage("Darbuotojas sekmingai uzregistruotas.");

      setTimeout(() => {
        handleCloseDialog();
      }, 500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko issaugoti darbuotojo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      {/* VIRŠUTINĖ DALIS - ANTRAŠTĖ IR "PRIDĖTI" MYGTUKAS */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Darbuotojai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Darbuotoju vadyba
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/72">
            Čia galite matyti ir pridėti naujus darbuotojus.
          </p>
        </div>

        <button
          onClick={() => void openEmployeeForm()}
          className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong whitespace-nowrap"
        >
          + Pridėti darbuotoją
        </button>
      </div>

      {/* PAGRINDINIS TURINYS - DARBUOTOJŲ SĄRAŠAS */}
      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
              Darbuotoju sarasas
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Esami darbuotojai</h3>
          </div>
          <button
            type="button"
            onClick={() => void loadEmployees()}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold transition hover:border-accent/30 hover:bg-background"
          >
            ↻ Atnaujinti
          </button>
        </div>

        {/* LENTELĖ */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Vardas</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">El. paštas</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Pareigos</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Patirtis</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-foreground/65">
                    Kraunama...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-foreground/65">
                    Darbuotoju sarasas tuscias.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.asmensKodas}
                    className="border-b border-border-soft/50 hover:bg-background/30 transition"
                  >
                    <td className="px-4 py-4 font-medium">
                      {employee.vardas} {employee.pavarde}
                    </td>
                    <td className="px-4 py-4">{employee.elPastas}</td>
                    <td className="px-4 py-4 text-foreground/80">{employee.role}</td>
                    <td className="px-4 py-4">{employee.patirtiesMetai} m.</td>
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
      </div>

      {/* MODAL DIALOGO FORMA */}
      <dialog
        ref={dialogRef}
        className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop:bg-black/50 backdrop:opacity-50"
      >
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-2">Pridėti naują darbuotoją</h3>
          <p className="text-foreground/65 mb-6">Užpildykite darbuotojo duomenis</p>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.asmensKodas}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    asmensKodas: event.target.value,
                  }))
                }
                placeholder="Asmens kodas"
                className="rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
              <input
                type="text"
                value={formData.vardas}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, vardas: event.target.value }))
                }
                placeholder="Vardas"
                className="rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.pavarde}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    pavarde: event.target.value,
                  }))
                }
                placeholder="Pavardė"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <input
                type="email"
                value={formData.elPastas}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    elPastas: event.target.value,
                  }))
                }
                placeholder="El. paštas"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.slaptazodis}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    slaptazodis: event.target.value,
                  }))
                }
                placeholder="Slaptažodis"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="tel"
                value={formData.telNr}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, telNr: event.target.value }))
                }
                placeholder="Tel. numeris"
                className="rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
              <select
                value={formData.role}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    role: event.target.value as EmployeeFormData["role"],
                  }))
                }
                className="rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              >
                <option value="gydytojas">Gydytojas</option>
                <option value="administratorius">Administratorius</option>
                <option value="laboratorijos darbuotojas">Laboratorijos darbuotojas</option>
              </select>
            </div>

            <div>
              <input
                type="number"
                min={0}
                value={formData.patirtiesMetai}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    patirtiesMetai: Number(event.target.value),
                  }))
                }
                placeholder="Patirties metai"
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>

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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saugoma..." : "Issaugoti"}
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="flex-1 rounded-xl border border-border-soft px-4 py-3 text-base font-semibold transition hover:bg-background/50"
              >
                Atšaukti
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </section>
  );
}
