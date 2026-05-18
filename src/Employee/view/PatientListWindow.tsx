"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { PatientListItem } from "@/src/Models/Patient";
import type {
  DoctorPatientListItem,
  ExaminationFormData,
} from "@/src/Models/Test";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PatientWindowOpening {
  openWindow: true;
}

interface DoctorPatientsDataResult {
  doctorPatientsData: PatientListItem[];
}

interface ExaminationFormDialog {
  dialog: ExaminationFormData;
  doctorPatients: DoctorPatientListItem[];
}

interface SubmitExaminationDataResult {
  successMessage: string;
}

const EXAMINATION_TYPES = [
  "Elektrofiziologinis tyrimas",
  "Vaizdinis tyrimas",
  "Laboratorinis tyrimas",
] as const;

const initialForm: ExaminationFormData = {
  tipas: "Laboratorinis tyrimas",
  data: new Date().toISOString().split("T")[0],
  kabinetas: 1,
  pacientas: "",
};

interface PatientListWindowProps {
  onOpenExaminationResults: (patientCode: string) => void;
  onOpenTransplantationRegistration: (patient: PatientListItem) => void;
}

export default function PatientListWindow({
  onOpenExaminationResults,
  onOpenTransplantationRegistration,
}: PatientListWindowProps) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatientListItem[]>(
    []
  );
  const [formData, setFormData] = useState<ExaminationFormData>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void openWindow();
  }, []);

  async function openWindow(): Promise<void> {
    setIsLoading(true);
    setError("");

    try {
      const openingResponse = await fetch(
        "/api/employee/PatientListWindow?action=initiateWindowOpening",
        { cache: "no-store" }
      );
      const openingPayload =
        (await openingResponse.json()) as ApiResponse<PatientWindowOpening>;

      if (!openingResponse.ok || !openingPayload.success || !openingPayload.data) {
        throw new Error(
          openingPayload.message ?? "Nepavyko atidaryti pacientu lango."
        );
      }

      await getDoctorPatients();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti pacientu lango."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function getDoctorPatients(): Promise<void> {
    const response = await fetch(
      "/api/employee/PatientListWindow?action=getDoctorPatients",
      { cache: "no-store" }
    );
    const payload =
      (await response.json()) as ApiResponse<DoctorPatientsDataResult>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message ?? "Nepavyko gauti gydytojo pacientu.");
    }

    setPatients(payload.data.doctorPatientsData);
  }

  async function openExaminationForm(patientCode: string): Promise<void> {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/employee/PatientListWindow?action=initiateFormOpening",
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<ExaminationFormDialog>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko atidaryti tyrimo paskyrimo formos."
        );
      }

      setDoctorPatients(payload.data.doctorPatients);
      setFormData({ ...payload.data.dialog, pacientas: patientCode });
      dialogRef.current?.showModal();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti tyrimo paskyrimo formos."
      );
    }
  }

  function closeDialog(): void {
    dialogRef.current?.close();
    setFormData(initialForm);
    setError("");
  }

  async function submitExaminationData(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/employee/PatientListWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          kabinetas: Number(formData.kabinetas),
        }),
      });
      const payload =
        (await response.json()) as ApiResponse<SubmitExaminationDataResult>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko issaugoti tyrimo.");
      }

      setMessage(payload.data.successMessage);
      setTimeout(() => {
        closeDialog();
      }, 500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko issaugoti tyrimo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefresh(): Promise<void> {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/employee/PatientListWindow?action=submitDueExaminations",
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ApiResponse<{ enqueued: number }>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko patikrinti tyrimu.");
      }

      const { enqueued } = payload.data;
      if (enqueued > 0) {
        setMessage(`Pateikta ${enqueued} tyrimų rezultatų.`);
      } else {
        setMessage("Nerasta naujų tyrimų rezultatams pateikti.");
      }

      // refresh patient list
      await getDoctorPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida atnaujinant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Pacientai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Gydytojo pacientai
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="rounded-2xl border border-border-soft bg-white/80 px-5 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
        >
          Atnaujinti
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="px-4 py-3 text-left font-semibold">Pacientas</th>
              <th className="px-4 py-3 text-left font-semibold">Kraujo grupe</th>
              <th className="px-4 py-3 text-left font-semibold">Amzius</th>
              <th className="px-4 py-3 text-left font-semibold">Rodikliai</th>
              <th className="px-4 py-3 text-left font-semibold">Veiksmai</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/65">
                  Kraunama...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/65">
                  Gydytojo pacientu sarasas tuscias.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.asmensKodas}
                  className="border-b border-border-soft/50 transition hover:bg-background/30"
                >
                  <td className="px-4 py-4 font-medium">
                    {patient.vardas} {patient.pavarde}
                    <span className="block text-xs text-foreground/55">
                      {patient.asmensKodas}
                    </span>
                  </td>
                  <td className="px-4 py-4">{patient.kraujoGrupe}</td>
                  <td className="px-4 py-4">{patient.amzius}</td>
                  <td className="px-4 py-4">
                    {patient.ugisCm} cm / {patient.svorisKg} kg
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void openExaminationForm(patient.asmensKodas)}
                        className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-strong"
                      >
                        Paskirti tyrima
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenExaminationResults(patient.asmensKodas)}
                        className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold transition hover:border-accent/30 hover:bg-background"
                      >
                        Perziureti tyrimu rezultatus
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenTransplantationRegistration(patient)
                        }
                        className="max-w-40 rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold leading-4 transition hover:border-accent/30 hover:bg-background"
                      >
                        Uzregistruoti transplantacijai
                      </button>
                    </div>
                  </td>
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
      {message ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop:bg-black/50 backdrop:opacity-50"
      >
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-2">Paskirti tyrima</h3>
          <form onSubmit={submitExaminationData} className="mt-6 space-y-4">
            <select
              value={formData.tipas}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  tipas: event.target.value as ExaminationFormData["tipas"],
                }))
              }
              className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
            >
              {EXAMINATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.data}
              onChange={(event) =>
                setFormData((current) => ({ ...current, data: event.target.value }))
              }
              className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
            />
            <input
              type="number"
              min={1}
              value={formData.kabinetas}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  kabinetas: Number(event.target.value),
                }))
              }
              placeholder="Kabinetas"
              className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
            />
            <div className="rounded-xl border border-border-soft bg-background/90 px-4 py-3 text-sm text-foreground/70">
              Pacientas parinktas automatiskai:{" "}
              {doctorPatients.find(
                (patient) => patient.asmensKodas === formData.pacientas
              )?.vardas ?? ""}{" "}
              {doctorPatients.find(
                (patient) => patient.asmensKodas === formData.pacientas
              )?.pavarde ?? ""}{" "}
              ({formData.pacientas})
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
        </div>
      </dialog>
    </section>
  );
}
