"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import EmployeeListWindow from "@/src/Admin/view/EmployeeListWindow";
import OperatingRoomWindow from "@/src/Admin/view/OperatingRoomWindow";
import OrganRegistrationWindow from "@/src/Admin/view/OrganRegistrationWindow";
import OperationsResultWindow from "@/src/Admin/view/OperationsResultWindow";
import type {
  SurgeryListItem,
  SurgeryFormData,
  SurgeryTimeOption,
  SurgerySubmissionResult,
} from "@/src/Models/Surgery";
import type { RecommendedDoctorListItem } from "@/src/Models/Employee";
import type { SurgeryResultListItem } from "@/src/Models/SurgeryResults";

type AdminView =
  | "overview"
  | "employees"
  | "operatingRooms"
  | "organRegistration"
  | "surgeries"
  | "operationResults";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OrganRegistrationWindowOpening {
  showOrganRegistrationWindow: true;
}

interface SurgeryFormOpening {
  showSurgeryForm: true;
}

interface OperationsResultListOpening {
  surgeryResults: SurgeryResultListItem[];
  surgeries: SurgeryListItem[];
}

const OPERATION_TYPES = [
  "Revaskuliarizacinė operacija",
  "Vožtuvų operacija",
  "Aortos ir didžiųjų kraujagyslių operacija",
  "Įgimtų ydų korekcija",
  "Ritmo chirurgija",
  "Mechaninės pagalbos ir transplantacijos operacija",
  "Rekonstrukcinė operacija",
  "Širdies navikų chirurgija",
  "Perikardo chirurgija",
  "Traumų chirurgija",
] as const;

const initialSurgeryForm: SurgeryFormData = {
  tipas: OPERATION_TYPES[0],
  prioritetas: "1",
  trukmeMin: 120,
  sudetingumas: "1",
  pacientas: "",
};

const quickStats = [
  {
    label: "Darbuotojo registracija",
    value: "01",
    hint: "Realizuota pagal tavo seku diagrama",
  },
  {
    label: "Operacines pridejimas",
    value: "02",
    hint: "Realizuota su DB issaugojimu",
  },
  {
    label: "Organo registracija",
    value: "03",
    hint: "Uzregistruoti gauta organa",
  },
  {
    label: "Operacijos pridejimas",
    value: "04",
    hint: "Laikai parenkami pagal prioritetu intervalus",
  },
];

const subsystemLinks = [
  { href: "/", label: "Pradinis" },
  { href: "/employee", label: "Darbuotojas" },
  { href: "/patient", label: "Pacientas" },
  { href: "/login", label: "Prisijungimas" },
];

function formatDoctorLabel(doctor: RecommendedDoctorListItem) {
  return `${doctor.vardas} ${doctor.pavarde} (${doctor.asmensKodas})`;
}

function SurgeryTimeList({
  options,
  selectedTime,
  selectedDoctorId,
  onChooseTime,
  onChooseDoctor,
}: {
  options: SurgeryTimeOption[];
  selectedTime: SurgeryTimeOption | null;
  selectedDoctorId: string;
  onChooseTime: (option: SurgeryTimeOption) => void;
  onChooseDoctor: (doctorId: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">
        Artimiausi galimi laikai
      </p>
      <div className="grid max-h-72 gap-3 overflow-y-auto pr-1">
        {options.map((option) => {
          const key = `${option.data}-${option.pradziosLaikas}-${option.operacineNr}`;
          const isSelected =
            selectedTime?.data === option.data &&
            selectedTime?.pradziosLaikas === option.pradziosLaikas &&
            selectedTime?.operacineNr === option.operacineNr;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onChooseTime(option)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-border-soft bg-white hover:border-accent/40"
              }`}
            >
              <span className="block font-semibold">
                {option.data} {option.pradziosLaikas}-{option.pabaigosLaikas},
                operacinė #{option.operacineNr}
              </span>
              <span className="mt-1 block text-xs text-foreground/65">
                Top 3 gydytojai:{" "}
                {option.rekomenduojamiGydytojai.map(formatDoctorLabel).join("; ")}
              </span>
              {option.pakeiciamaOperacija ? (
                <span className="mt-1 block text-xs font-semibold text-amber-700">
                  Bus perkeliama žemesnio prioriteto operacija #
                  {option.pakeiciamaOperacija.id}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedTime ? (
        <label className="block text-sm">
          <span className="font-semibold">Pasirinkti gydytoją</span>
          <select
            value={selectedDoctorId}
            onChange={(event) => onChooseDoctor(event.target.value)}
            className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
          >
            {selectedTime.rekomenduojamiGydytojai.map((doctor: RecommendedDoctorListItem) => (
              <option key={doctor.asmensKodas} value={doctor.asmensKodas}>
                {formatDoctorLabel(doctor)} | rodiklis {doctor.rodiklis}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}

function renderView(
  activeView: AdminView,
  organRegistrationOpening: OrganRegistrationWindowOpening | null,
  organRegistrationOpeningSequence: number,
  organRegistrationOpeningError: string,
  isOrganRegistrationOpening: boolean,
  operationsResultOpening: OperationsResultListOpening | null,
  operationsResultOpeningError: string,
  isOperationsResultOpening: boolean
) {
  if (activeView === "employees") {
    return <EmployeeListWindow />;
  }

  if (activeView === "operatingRooms") {
    return <OperatingRoomWindow />;
  }

  if (activeView === "organRegistration") {
    if (isOrganRegistrationOpening) {
      return (
        <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Organai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Organo registracija
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/72">
            Atidaromas organo registracijos langas...
          </p>
        </section>
      );
    }

    if (organRegistrationOpeningError || !organRegistrationOpening) {
      return (
        <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Organai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Organo registracija
          </h2>
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {organRegistrationOpeningError ||
              "Nepavyko atidaryti organo registracijos lango."}
          </p>
        </section>
      );
    }

    return (
      <OrganRegistrationWindow
        opening={organRegistrationOpening}
        openingSequence={organRegistrationOpeningSequence}
      />
    );
  }

  if (activeView === "operationResults") {
    if (isOperationsResultOpening) {
      return (
        <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operaciju rezultatai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Operaciju rezultatu sarasas
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/72">
            Atidaromas operaciju rezultatu sarasas...
          </p>
        </section>
      );
    }

    if (operationsResultOpeningError || !operationsResultOpening) {
      return (
        <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operaciju rezultatai
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Operaciju rezultatu sarasas
          </h2>
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {operationsResultOpeningError ||
              "Nepavyko atidaryti operaciju rezultatu saraso."}
          </p>
        </section>
      );
    }

    return <OperationsResultWindow opening={operationsResultOpening} />;
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Apzvalga
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Administravimo aplinka
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/70">
            AdminWindow valdo kitus administratoriaus langus. Is cia gali
            atidaryti darbuotojo registracijos ir operacines pridejimo langus.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-border-soft bg-white/80 px-4 py-5"
            >
              <p className="text-sm text-foreground/60">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs leading-5 text-foreground/55">
                {stat.hint}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AdminWindow() {
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [surgeryOpening, setSurgeryOpening] = useState<SurgeryFormOpening | null>(
    null
  );
  const [surgeryForm, setSurgeryForm] =
    useState<SurgeryFormData>(initialSurgeryForm);
  const [surgeryTimeOptions, setSurgeryTimeOptions] = useState<
    SurgeryTimeOption[]
  >([]);
  const [selectedSurgeryTime, setSelectedSurgeryTime] =
    useState<SurgeryTimeOption | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [movingSurgeryId, setMovingSurgeryId] = useState<number | null>(null);
  const [surgeryMessage, setSurgeryMessage] = useState("");
  const [surgeryError, setSurgeryError] = useState("");
  const [isSurgeryFormOpening, setIsSurgeryFormOpening] = useState(false);
  const [isCheckingSurgeryData, setIsCheckingSurgeryData] = useState(false);
  const [isSavingSurgery, setIsSavingSurgery] = useState(false);
  const [organRegistrationOpening, setOrganRegistrationOpening] =
    useState<OrganRegistrationWindowOpening | null>(null);
  const [organRegistrationOpeningSequence, setOrganRegistrationOpeningSequence] =
    useState(0);
  const [organRegistrationOpeningError, setOrganRegistrationOpeningError] =
    useState("");
  const [isOrganRegistrationOpening, setIsOrganRegistrationOpening] =
    useState(false);
  const [operationsResultOpening, setOperationsResultOpening] =
    useState<OperationsResultListOpening | null>(null);
  const [operationsResultOpeningError, setOperationsResultOpeningError] =
    useState("");
  const [isOperationsResultOpening, setIsOperationsResultOpening] =
    useState(false);

  function openEmployeeList(): void {
    setActiveView("employees");
  }

  function openOperatingRoomsList(): void {
    setActiveView("operatingRooms");
  }

  async function openOperationsResultList(): Promise<void> {
    setActiveView("operationResults");
    setIsOperationsResultOpening(true);
    setOperationsResultOpeningError("");

    try {
      const response = await fetch(
        "/api/admin/OperationsResultWindow?action=openOperationsResultList",
        { cache: "no-store" }
      );
      const payload =
        (await response.json()) as ApiResponse<OperationsResultListOpening>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko atidaryti operaciju rezultatu saraso."
        );
      }

      setOperationsResultOpening(payload.data);
    } catch (openingError) {
      setOperationsResultOpening(null);
      setOperationsResultOpeningError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti operaciju rezultatu saraso."
      );
    } finally {
      setIsOperationsResultOpening(false);
    }
  }

  async function openSurgeryForm(): Promise<void> {
    setActiveView("surgeries");
    setIsSurgeryFormOpening(true);
    setSurgeryError("");
    setSurgeryMessage("");

    try {
      const response = await fetch("/api/admin/SurgeryListWindow", {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse<SurgeryFormOpening>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko atidaryti operacijos įvedimo formos."
        );
      }

      setSurgeryOpening(payload.data);
      setSurgeryForm(initialSurgeryForm);
      setSurgeryTimeOptions([]);
      setSelectedSurgeryTime(null);
      setSelectedDoctorId("");
      setMovingSurgeryId(null);
      dialogRef.current?.showModal();
    } catch (openingError) {
      setSurgeryOpening(null);
      setSurgeryError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti operacijos įvedimo formos."
      );
    } finally {
      setIsSurgeryFormOpening(false);
    }
  }

  function chooseSurgeryTime(option: SurgeryTimeOption): void {
    setSelectedSurgeryTime(option);
    setSelectedDoctorId(option.rekomenduojamiGydytojai[0]?.asmensKodas ?? "");
  }

  async function submitExaminationData(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setIsCheckingSurgeryData(true);
    setSurgeryError("");
    setSurgeryMessage("");
    setSurgeryTimeOptions([]);
    setSelectedSurgeryTime(null);
    setSelectedDoctorId("");

    try {
      const response = await fetch("/api/admin/SurgeryListWindow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surgeryForm),
      });
      const payload = (await response.json()) as ApiResponse<SurgeryTimeOption[]>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko rasti galimų laikų.");
      }

      setSurgeryTimeOptions(payload.data);
      if (payload.data[0]) chooseSurgeryTime(payload.data[0]);
      setSurgeryMessage("Pasirinkite vieną iš artimiausių galimų laikų.");
    } catch (submitError) {
      setSurgeryError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko patikrinti operacijos duomenų."
      );
    } finally {
      setIsCheckingSurgeryData(false);
    }
  }

  async function saveSelectedSurgery(): Promise<void> {
    if (!selectedSurgeryTime || !selectedDoctorId) {
      setSurgeryError("Pasirinkite operacijos laiką ir gydytoją.");
      return;
    }

    setIsSavingSurgery(true);
    setSurgeryError("");
    setSurgeryMessage("");

    try {
      const response = await fetch(
        "/api/admin/SurgeryListWindow?action=saveSurgery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...surgeryForm,
            selectedTime: selectedSurgeryTime,
            gydytojasId: selectedDoctorId,
            perkeliamaOperacijaId: movingSurgeryId ?? undefined,
          }),
        }
      );
      const payload = (await response.json()) as ApiResponse<SurgerySubmissionResult>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko įrašyti operacijos.");
      }

      if (payload.data.warning && payload.data.replacedSurgery) {
        setSurgeryForm({
          tipas: payload.data.replacedSurgery.tipas,
          prioritetas: payload.data.replacedSurgery.prioritetas,
          trukmeMin: payload.data.replacedSurgery.trukmeMin,
          sudetingumas: payload.data.replacedSurgery.sudetingumas,
          pacientas: payload.data.replacedSurgery.pacientas,
        });
        setSurgeryTimeOptions(payload.data.nextOptions);
        setMovingSurgeryId(payload.data.replacedSurgery.id);
        if (payload.data.nextOptions[0]) {
          chooseSurgeryTime(payload.data.nextOptions[0]);
        }
        setSurgeryMessage(payload.data.warning);
      } else {
        setSurgeryMessage("Operacija sėkmingai pridėta.");
        setTimeout(() => {
          dialogRef.current?.close();
          setSurgeryOpening(null);
          setSurgeryForm(initialSurgeryForm);
          setSurgeryTimeOptions([]);
          setSelectedSurgeryTime(null);
          setSelectedDoctorId("");
          setMovingSurgeryId(null);
        }, 700);
      }
    } catch (saveError) {
      setSurgeryError(
        saveError instanceof Error
          ? saveError.message
          : "Nepavyko įrašyti operacijos."
      );
    } finally {
      setIsSavingSurgery(false);
    }
  }

  function closeSurgeryDialog(): void {
    dialogRef.current?.close();
    setSurgeryOpening(null);
    setSurgeryForm(initialSurgeryForm);
    setSurgeryTimeOptions([]);
    setSelectedSurgeryTime(null);
    setSelectedDoctorId("");
    setMovingSurgeryId(null);
    setSurgeryMessage("");
    setSurgeryError("");
  }

  async function initiateOrganRegistrationWindowOpening(): Promise<void> {
    setActiveView("organRegistration");
    setIsOrganRegistrationOpening(true);
    setOrganRegistrationOpeningError("");

    try {
      const response = await fetch(
        "/api/admin/OrganRegistrationWindow?action=initiateOrganRegistrationWindowOpening",
        { cache: "no-store" }
      );
      const payload =
        (await response.json()) as ApiResponse<OrganRegistrationWindowOpening>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message ?? "Nepavyko atidaryti organo registracijos lango."
        );
      }

      setOrganRegistrationOpening(payload.data);
      setOrganRegistrationOpeningSequence((current) => current + 1);
    } catch (openingError) {
      setOrganRegistrationOpening(null);
      setOrganRegistrationOpeningError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti organo registracijos lango."
      );
    } finally {
      setIsOrganRegistrationOpening(false);
    }
  }

  function selectOrganRegistration(): void {
    void initiateOrganRegistrationWindowOpening();
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
      <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="rounded-[1.6rem] bg-[linear-gradient(145deg,rgba(31,122,140,0.16),rgba(255,255,255,0.95))] p-5">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Administratoriaus skydelis
            </p>
            <h1 className="display-font mt-3 text-3xl leading-tight font-semibold">
              Kardio skyriaus administratoriaus langas
            </h1>
            <p className="mt-4 text-sm leading-6 text-foreground/72">
              Pagrindinis langas, is kurio atidaromi kiti administratoriaus
              langai.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setActiveView("overview")}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Pagrindinis administratoriaus langas
            </button>
            <button
              type="button"
              onClick={() => openEmployeeList()}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Darbuotojai
            </button>
            <button
              type="button"
              onClick={() => openOperatingRoomsList()}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Operacines
            </button>
            <button
              type="button"
              onClick={() => selectOrganRegistration()}
              disabled={isOrganRegistrationOpening}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3
               text-left text-sm font-medium transition hover:border-accent/30 hover:
               bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Uzregistruoti organa
            </button>
            <button
                type="button"
                onClick={() => void openSurgeryForm()}
                className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
              >
                Pridėti operaciją
            </button>
            <button
              type="button"
              onClick={() => void openOperationsResultList()}
              disabled={isOperationsResultOpening}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Operaciju rezultatai
            </button>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-border-soft bg-white/70 p-5">
            <p className="text-sm font-semibold text-foreground">Kiti keliai</p>
            <div className="mt-4 grid gap-3">
              {subsystemLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-border-soft px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section>
          {renderView(
            activeView,
            organRegistrationOpening,
            organRegistrationOpeningSequence,
            organRegistrationOpeningError,
            isOrganRegistrationOpening,
            operationsResultOpening,
            operationsResultOpeningError,
            isOperationsResultOpening
          )}
        </section>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(920px,calc(100vw-2rem))] rounded-[2rem] border border-white/70 bg-surface p-0 shadow-[var(--shadow)] backdrop:bg-black/50"
      >
        {surgeryOpening ? (
          <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-border-soft pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                  Pridėti operaciją
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Operacijos įvedimo forma
                </h3>
              </div>
              <button
                type="button"
                onClick={closeSurgeryDialog}
                className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold transition hover:bg-background"
              >
                Uždaryti
              </button>
            </div>

            <form onSubmit={submitExaminationData} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-semibold">Operacijos tipas</span>
                  <select
                    value={surgeryForm.tipas}
                    onChange={(event) =>
                      setSurgeryForm((current: SurgeryFormData) => ({
                        ...current,
                        tipas: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    {OPERATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-semibold">Paciento asmens kodas</span>
                  <input
                    value={surgeryForm.pacientas}
                    onChange={(event) =>
                      setSurgeryForm((current: SurgeryFormData) => ({
                        ...current,
                        pacientas: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                    inputMode="numeric"
                    maxLength={11}
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-semibold">Prioritetas</span>
                  <select
                    value={surgeryForm.prioritetas}
                    onChange={(event) =>
                      setSurgeryForm((current: SurgeryFormData) => ({
                        ...current,
                        prioritetas: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    <option value="1">1 - 1 diena</option>
                    <option value="2">2 - 3 dienos</option>
                    <option value="3">3 - 7 dienos</option>
                    <option value="4">4 - 14 dienų</option>
                    <option value="5">5 - 30 dienų</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-semibold">Sudėtingumas</span>
                  <select
                    value={surgeryForm.sudetingumas}
                    onChange={(event) =>
                      setSurgeryForm((current) => ({
                        ...current,
                        sudetingumas: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </label>

                <label className="block text-sm md:col-span-2">
                  <span className="font-semibold">Trukmė minutėmis</span>
                  <input
                    type="number"
                    min={30}
                    max={480}
                    step={30}
                    value={surgeryForm.trukmeMin}
                    onChange={(event) =>
                      setSurgeryForm((current) => ({
                        ...current,
                        trukmeMin: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
              </div>

              {surgeryError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {surgeryError}
                </p>
              ) : null}

              {surgeryMessage ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {surgeryMessage}
                </p>
              ) : null}

              <SurgeryTimeList
                options={surgeryTimeOptions}
                selectedTime={selectedSurgeryTime}
                selectedDoctorId={selectedDoctorId}
                onChooseTime={chooseSurgeryTime}
                onChooseDoctor={setSelectedDoctorId}
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isCheckingSurgeryData || isSavingSurgery}
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCheckingSurgeryData ? "Ieškoma..." : "Ieškoti laikų"}
                </button>
                {selectedSurgeryTime ? (
                  <button
                    type="button"
                    onClick={() => void saveSelectedSurgery()}
                    disabled={
                      isSavingSurgery ||
                      isCheckingSurgeryData ||
                      !selectedDoctorId
                    }
                    className="rounded-xl border border-border-soft bg-white/80 px-5 py-3 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingSurgery
                      ? "Įrašoma..."
                      : "Įrašyti operacijos informaciją"}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
