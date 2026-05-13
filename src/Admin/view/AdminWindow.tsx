"use client";

import Link from "next/link";
import { useState } from "react";
import EmployeeListWindow from "@/src/Admin/view/EmployeeListWindow";
import OperatingRoomWindow from "@/src/Admin/view/OperatingRoomWindow";
import OrganRegistrationWindow from "@/src/Admin/view/OrganRegistrationWindow";
import SurgeryListWindow from "@/src/Admin/view/SurgeryListWindow";

type AdminView =
  | "overview"
  | "employees"
  | "operatingRooms"
  | "organRegistration"
  | "surgeries";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OrganRegistrationWindowOpening {
  showOrganRegistrationWindow: true;
}

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
];

const subsystemLinks = [
  { href: "/", label: "Pradinis" },
  { href: "/employee", label: "Darbuotojas" },
  { href: "/patient", label: "Pacientas" },
  { href: "/login", label: "Prisijungimas" },
];

function renderView(
  activeView: AdminView,
  organRegistrationOpening: OrganRegistrationWindowOpening | null,
  organRegistrationOpeningSequence: number,
  organRegistrationOpeningError: string,
  isOrganRegistrationOpening: boolean
) {
  if (activeView === "employees") {
    return <EmployeeListWindow />;
  }

  if (activeView === "operatingRooms") {
    return <OperatingRoomWindow />;
  }

  if (activeView === "surgeries") {
    return <SurgeryListWindow />;
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
  const [organRegistrationOpening, setOrganRegistrationOpening] =
    useState<OrganRegistrationWindowOpening | null>(null);
  const [organRegistrationOpeningSequence, setOrganRegistrationOpeningSequence] =
    useState(0);
  const [organRegistrationOpeningError, setOrganRegistrationOpeningError] =
    useState("");
  const [isOrganRegistrationOpening, setIsOrganRegistrationOpening] =
    useState(false);

  function openEmployeeList(): void {
    setActiveView("employees");
  }

  function openOperatingRoomsList(): void {
    setActiveView("operatingRooms");
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
              onClick={() => setActiveView("surgeries")}
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Operacijos
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
            <Link
              href="/admin/doctor-coordination-test"
              className="block w-full rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Suderinti gydytojus (test)
            </Link>
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
            isOrganRegistrationOpening
          )}
        </section>
      </div>
    </main>
  );
}
