"use client";

import Link from "next/link";
import { useState } from "react";
import ExaminationResultListWindow from "@/src/Employee/view/ExaminationResultListWindow";
import PatientListWindow from "@/src/Employee/view/PatientListWindow";
import SurgeryRoomWindow from "@/src/Employee/view/SurgeryRoomWindow";
import TimeTableWindow from "@/src/Employee/view/TimeTableWindow";
import TransplantationRegistrationWindow from "@/src/Employee/view/TransplantationRegistrationWindow";
import TransplantationUpdateWindow from "@/src/Employee/view/TransplantationUpdateWindow";
import TransplantationWindow, {
  type TransplantationUpdateWindowOpening,
} from "@/src/Employee/view/TransplantationWindow";
import type { PatientListItem } from "@/src/Models/Patient";
import type { TransplantationRegistrationFormData } from "@/src/Models/Transplantation";

type EmployeeView =
  | "overview"
  | "patients"
  | "results"
  | "timeTable"
  | "rooms"
  | "transplantations"
  | "transplantationRegistration"
  | "transplantationUpdate";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TransplantationRegistrationWindowOpening {
  transplantationRegistrationForm: TransplantationRegistrationFormData;
}

const navigation = [
  { href: "/", label: "Pradinis" },
  { href: "/admin", label: "Administratorius" },
  { href: "/patient", label: "Pacientas" },
  { href: "/login", label: "Prisijungimas" },
];

const overviewActions = [
  {
    key: "patients",
    view: "patients",
    title: "Perziureti pacientus",
    description: "Gydytojo pacientai pagal vizitu irasus.",
  },
  {
    key: "transplantations",
    view: "transplantations",
    title: "Atnaujinti transplantacija",
    description: "Pasirinkite transplantacija duomenu atnaujinimui.",
  },
  {
    key: "timeTable",
    view: "timeTable",
    title: "Perziureti operaciju grafika",
    description: "Operaciju sarasas ir planuojamos datos.",
  },
  {
    key: "rooms",
    view: "rooms",
    title: "Perziureti operaciniu uzimtuma",
    description: "Operaciniu panaudojimas pagal operaciju irasus.",
  },
] as const satisfies readonly {
  key: string;
  view: EmployeeView;
  title: string;
  description: string;
}[];

export default function EmployeeWindow() {
  const [activeView, setActiveView] = useState<EmployeeView>("overview");
  const [selectedPatientCode, setSelectedPatientCode] = useState<string>();
  const [
    transplantationRegistrationForm,
    setTransplantationRegistrationForm,
  ] = useState<TransplantationRegistrationFormData>();
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem>();
  const [transplantationUpdateOpening, setTransplantationUpdateOpening] =
    useState<TransplantationUpdateWindowOpening>();

  function openWindow(view: EmployeeView): void {
    setActiveView(view);
  }

  async function openTransplantationRegistrationWindow(
    patientCode: string
  ): Promise<void> {
    const response = await fetch(
      `/api/employee/TransplantationRegistrationWindow?action=initiateTransplantationRegistrationWindowOpening&pacientas=${encodeURIComponent(
        patientCode
      )}`,
      { cache: "no-store" }
    );
    const payload =
      (await response.json()) as ApiResponse<TransplantationRegistrationWindowOpening>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(
        payload.message ??
          "Nepavyko atidaryti transplantacijos registravimo formos."
      );
    }

    setTransplantationRegistrationForm(
      payload.data.transplantationRegistrationForm
    );
    openWindow("transplantationRegistration");
  }

  function renderView() {
    if (activeView === "patients") {
      return (
        <PatientListWindow
          onOpenExaminationResults={(patientCode) => {
            setSelectedPatientCode(patientCode);
            openWindow("results");
          }}
          onOpenTransplantationRegistration={(patient) => {
            setSelectedPatient(patient);
            setSelectedPatientCode(patient.asmensKodas);
            void openTransplantationRegistrationWindow(patient.asmensKodas);
          }}
        />
      );
    }

    if (activeView === "results") {
      return <ExaminationResultListWindow patientCode={selectedPatientCode} />;
    }

    if (activeView === "transplantations") {
      return (
        <TransplantationWindow
          onOpenTransplantationUpdate={(opening) => {
            setTransplantationUpdateOpening(opening);
            openWindow("transplantationUpdate");
          }}
        />
      );
    }

    if (activeView === "timeTable") {
      return <TimeTableWindow />;
    }

    if (activeView === "rooms") {
      return <SurgeryRoomWindow />;
    }

    if (activeView === "transplantationRegistration") {
      return transplantationRegistrationForm ? (
        <TransplantationRegistrationWindow
          transplantationRegistrationForm={transplantationRegistrationForm}
          patient={selectedPatient}
          onCancelRegistration={() => openWindow("patients")}
        />
      ) : null;
    }

    if (activeView === "transplantationUpdate") {
      return transplantationUpdateOpening ? (
        <TransplantationUpdateWindow opening={transplantationUpdateOpening} />
      ) : null;
    }

    return (
      <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Darbuotojo posisteme
            </p>
            <h1 className="display-font mt-3 text-4xl font-semibold sm:text-5xl">
              Darbuotojo darbo aplinkos perziura
            </h1>
            <p className="mt-4 text-base leading-7 text-foreground/72 sm:text-lg">
              Pasirinkite darbuotojo posistemes veiksma.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border-soft bg-white/80 px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {overviewActions.map((action) => (
            <article
              key={action.key}
              className="rounded-[1.5rem] border border-border-soft bg-white/80 p-5"
            >
              <h2 className="text-xl font-semibold">{action.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/68">
                {action.description}
              </p>
              <button
                type="button"
                onClick={() => openWindow(action.view)}
                className="mt-5 w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Atidaryti
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {activeView !== "overview" ? (
          <button
            type="button"
            onClick={() => openWindow("overview")}
            className="w-fit rounded-xl border border-border-soft bg-white/80 px-5 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
          >
            Grizti i darbuotojo meniu
          </button>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border-soft bg-white/80 px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {renderView()}
    </main>
  );
}
