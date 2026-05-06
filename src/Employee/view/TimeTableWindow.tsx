"use client";

import { useEffect, useState } from "react";
import type { SurgeryListItem } from "@/src/Models/Surgery";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface SurgeriesResult {
  surgeriesList: SurgeryListItem[];
}

const WEEK_DAYS = [
  { label: "Pirmadienis", offset: 0 },
  { label: "Antradienis", offset: 1 },
  { label: "Treciadienis", offset: 2 },
  { label: "Ketvirtadienis", offset: 3 },
  { label: "Penktadienis", offset: 4 },
];

const TIME_SLOTS = Array.from({ length: 19 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const day = date.getDay() === 0 ? 7 : date.getDay();
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() - day + 1);
  return monday;
}

function getInitialWeekStart(): Date {
  return getMonday(new Date());
}

export default function TimeTableWindow() {
  const [surgeries, setSurgeries] = useState<SurgeryListItem[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => getInitialWeekStart());
  const [selectedSurgeries, setSelectedSurgeries] = useState<SurgeryListItem[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void openWindow();
  }, []);

  async function openWindow(): Promise<void> {
    setIsLoading(true);
    setError("");

    try {
      const openingResponse = await fetch(
        "/api/employee/TimeTableWindow?action=initiateWindowOpening",
        { cache: "no-store" }
      );
      const openingPayload = (await openingResponse.json()) as ApiResponse<{
        openWindow: true;
      }>;

      if (!openingResponse.ok || !openingPayload.success || !openingPayload.data) {
        throw new Error(openingPayload.message ?? "Nepavyko atidaryti grafiko.");
      }

      await getSurgeries();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti grafiko."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function getSurgeries(): Promise<void> {
    const response = await fetch(
      "/api/employee/TimeTableWindow?action=getSurgeries",
      { cache: "no-store" }
    );
    const payload = (await response.json()) as ApiResponse<SurgeriesResult>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message ?? "Nepavyko gauti operaciju grafiko.");
    }

    const surgeriesList = payload.data.surgeriesList;
    setSurgeries(surgeriesList);

    if (
      surgeriesList.length > 0 &&
      !surgeriesList.some((surgery) =>
        getWeekDates(weekStart).includes(surgery.data)
      )
    ) {
      setWeekStart(getMonday(new Date(`${surgeriesList[0].data}T12:00:00`)));
    }
  }

  function getWeekDates(start: Date): string[] {
    return WEEK_DAYS.map(({ offset }) => {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      return formatDate(date);
    });
  }

  function changeWeek(direction: -1 | 1): void {
    setSelectedSurgeries([]);
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + direction * 7);
      return next;
    });
  }

  function getSurgeryColor(surgery: SurgeryListItem): string {
    if (surgery.busena === "atliktas") {
      return "bg-slate-500 hover:bg-slate-600";
    }

    if (surgery.busena === "aktīvus" || surgery.busena === "aktyvus") {
      return "bg-amber-500 hover:bg-amber-600";
    }

    return "bg-emerald-600 hover:bg-emerald-700";
  }

  function findSurgeries(date: string, time: string): SurgeryListItem[] {
    return filteredSurgeries.filter((surgery) => {
      const startMinutes = toMinutes(surgery.pradziosLaikas);
      const endMinutes = startMinutes + surgery.trukmeMin;
      const slotMinutes = toMinutes(time);
      return (
        surgery.data === date &&
        slotMinutes >= startMinutes &&
        slotMinutes < endMinutes
      );
    });
  }

  function toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const weekDates = getWeekDates(weekStart);
  const todayWeekStart = getInitialWeekStart();
  const yearEndWeekStart = getMonday(new Date(`${weekStart.getFullYear()}-12-31T12:00:00`));
  const canGoBack = weekStart > todayWeekStart;
  const canGoForward = weekStart < yearEndWeekStart;
  const surgeryTypes = Array.from(
    new Set(surgeries.map((surgery) => surgery.tipas))
  ).sort((first, second) => first.localeCompare(second));
  const filteredSurgeries =
    selectedType === "all"
      ? surgeries
      : surgeries.filter((surgery) => surgery.tipas === selectedType);
  const visibleSurgeriesCount = filteredSurgeries.filter((surgery) =>
    weekDates.includes(surgery.data)
  ).length;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operacijos
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Perziureti operaciju grafika
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            {weekDates[0]} - {weekDates[4]} · {visibleSurgeriesCount} irasu
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-56 flex-col gap-1 text-xs font-semibold text-foreground/65">
            Operacijos tipas
            <select
              value={selectedType}
              onChange={(event) => {
                setSelectedType(event.target.value);
                setSelectedSurgeries([]);
              }}
              className="rounded-xl border border-border-soft bg-white/80 px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent"
            >
              <option value="all">Visi tipai</option>
              {surgeryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            disabled={!canGoBack}
            className="min-w-28 rounded-xl border border-border-soft bg-white/80 px-4 py-3 text-sm font-semibold transition hover:border-accent/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Ankstesne
          </button>
          <button
            type="button"
            onClick={() => changeWeek(1)}
            disabled={!canGoForward}
            className="min-w-28 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
          >
            Kita savaite
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-foreground/70">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-600" /> Užregistruota
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-500" /> Aktyvi
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-500" /> Atlikta
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-border-soft bg-background/50" /> Laisva
        </span>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border-soft bg-white/80 p-4">
        <table className="min-w-[1180px] w-full table-fixed text-xs">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="w-36 px-3 py-3 text-left font-semibold">Diena</th>
              {TIME_SLOTS.map((slot) => (
                <th key={slot} className="px-2 py-3 text-center font-semibold">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={TIME_SLOTS.length + 1}
                  className="px-4 py-8 text-center text-foreground/65"
                >
                  Kraunama...
                </td>
              </tr>
            ) : visibleSurgeriesCount === 0 ? (
              <tr>
                <td
                  colSpan={TIME_SLOTS.length + 1}
                  className="px-4 py-8 text-center text-foreground/65"
                >
                  Siai savaitei operaciju nera. Pasirinkite kita savaite.
                </td>
              </tr>
            ) : (
              WEEK_DAYS.map((day, dayIndex) => (
                <tr key={day.label} className="border-b border-border-soft/50">
                  <td className="px-3 py-3 font-semibold">
                    {day.label}
                    <span className="block text-[11px] font-normal text-foreground/55">
                      {weekDates[dayIndex]}
                    </span>
                  </td>
                  {TIME_SLOTS.map((slot) => {
                    const daySurgeries = findSurgeries(weekDates[dayIndex], slot);
                    const surgery = daySurgeries[0];

                    return (
                      <td key={`${day.label}-${slot}`} className="p-1 align-top">
                        {surgery ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSurgeries(daySurgeries)}
                            className={`min-h-12 w-full rounded-lg px-2 py-1 text-left text-[11px] font-semibold leading-4 text-white transition ${getSurgeryColor(surgery)}`}
                          >
                            Op. #{surgery.id}
                            <span className="block truncate font-normal">
                              {daySurgeries.length > 1
                                ? `${daySurgeries.length} operacijos`
                                : surgery.tipas}
                            </span>
                          </button>
                        ) : (
                          <div className="min-h-12 rounded-lg border border-border-soft/60 bg-background/50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedSurgeries.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-border-soft bg-white/80 p-4 text-sm">
          <p className="font-semibold">Pasirinkto laiko operacijos</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {selectedSurgeries.map((selectedSurgery) => (
              <div
                key={selectedSurgery.id}
                className="rounded-xl border border-border-soft bg-background/60 p-3"
              >
                <p className="font-semibold">
                  #{selectedSurgery.id} {selectedSurgery.tipas}
                </p>
                <p className="mt-2 text-foreground/70">
                  {selectedSurgery.data} {selectedSurgery.pradziosLaikas},
                  operacine {selectedSurgery.operacineNr}, trukme{" "}
                  {selectedSurgery.trukmeMin} min., prioritetas{" "}
                  {selectedSurgery.prioritetas}, busena: {selectedSurgery.busena},
                  pacientas: {selectedSurgery.pacientas}.
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
