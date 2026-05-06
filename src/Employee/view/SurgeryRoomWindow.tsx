"use client";

import { useEffect, useState } from "react";
import type {
  SurgeryRoomScheduleItem,
  SurgeryRoomUsageItem,
} from "@/src/Models/SurgeryRoom";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface SurgeryRoomsResult {
  operatingRooms: SurgeryRoomUsageItem[];
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

export default function SurgeryRoomWindow() {
  const [operatingRooms, setOperatingRooms] = useState<SurgeryRoomUsageItem[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => getInitialWeekStart());
  const [selectedOperations, setSelectedOperations] = useState<
    SurgeryRoomScheduleItem[]
  >([]);
  const [selectedRoom, setSelectedRoom] = useState("all");
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
        "/api/employee/SurgeryRoomWindow?action=initiateWindowOpening",
        { cache: "no-store" }
      );
      const openingPayload = (await openingResponse.json()) as ApiResponse<{
        openWindow: true;
      }>;

      if (!openingResponse.ok || !openingPayload.success || !openingPayload.data) {
        throw new Error(
          openingPayload.message ?? "Nepavyko atidaryti operaciniu uzimtumo."
        );
      }

      await getSurgeryRooms();
    } catch (openingError) {
      setError(
        openingError instanceof Error
          ? openingError.message
          : "Nepavyko atidaryti operaciniu uzimtumo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function getSurgeryRooms(): Promise<void> {
    const response = await fetch(
      "/api/employee/SurgeryRoomWindow?action=getSurgeryRooms",
      { cache: "no-store" }
    );
    const payload = (await response.json()) as ApiResponse<SurgeryRoomsResult>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message ?? "Nepavyko gauti operaciniu uzimtumo.");
    }

    const rooms = payload.data.operatingRooms;
    setOperatingRooms(rooms);

    const operations = rooms.flatMap((room) => room.operacijos);
    if (
      operations.length > 0 &&
      !operations.some((operation) =>
        getWeekDates(weekStart).includes(operation.data)
      )
    ) {
      setWeekStart(getMonday(new Date(`${operations[0].data}T12:00:00`)));
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
    setSelectedOperations([]);
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + direction * 7);
      return next;
    });
  }

  function getOperationColor(operationsCount: number): string {
    return operationsCount > 1
      ? "bg-amber-500 hover:bg-amber-600"
      : "bg-accent hover:bg-accent-strong";
  }

  function findOperations(date: string, time: string): SurgeryRoomScheduleItem[] {
    return filteredRooms.flatMap((room) =>
      room.operacijos.filter((operation) => {
        const startMinutes = toMinutes(operation.pradziosLaikas);
        const endMinutes = startMinutes + operation.trukmeMin;
        const slotMinutes = toMinutes(time);
        return (
          operation.data === date &&
          slotMinutes >= startMinutes &&
          slotMinutes < endMinutes
        );
      })
    );
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
  const filteredRooms =
    selectedRoom === "all"
      ? operatingRooms
      : operatingRooms.filter((room) => String(room.nr) === selectedRoom);
  const visibleOperationsCount = filteredRooms
    .flatMap((room) => room.operacijos)
    .filter((operation) => weekDates.includes(operation.data)).length;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Operacines
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Perziureti operaciniu uzimtuma
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            {weekDates[0]} - {weekDates[4]} · {visibleOperationsCount} irasu
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-44 flex-col gap-1 text-xs font-semibold text-foreground/65">
            Operacine
            <select
              value={selectedRoom}
              onChange={(event) => {
                setSelectedRoom(event.target.value);
                setSelectedOperations([]);
              }}
              className="rounded-xl border border-border-soft bg-white/80 px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent"
            >
              <option value="all">Visos operacines</option>
              {operatingRooms.map((room) => (
                <option key={room.nr} value={String(room.nr)}>
                  Operacine {room.nr}
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
          <span className="h-3 w-3 rounded bg-accent" /> Viena operacija
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-500" /> Kelios operacijos tame tarpe
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
            ) : visibleOperationsCount === 0 ? (
              <tr>
                <td
                  colSpan={TIME_SLOTS.length + 1}
                  className="px-4 py-8 text-center text-foreground/65"
                >
                  Siai savaitei operaciniu uzimtumo nera. Pasirinkite kita savaite.
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
                    const operations = findOperations(weekDates[dayIndex], slot);
                    const operation = operations[0];

                    return (
                      <td key={`${day.label}-${slot}`} className="p-1 align-top">
                        {operation ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOperations(operations)}
                            className={`min-h-12 w-full rounded-lg px-2 py-1 text-left text-[11px] font-semibold leading-4 text-white transition ${getOperationColor(operations.length)}`}
                          >
                            Op. {operation.operacineNr}
                            <span className="block truncate font-normal">
                              {operations.length > 1
                                ? `${operations.length} operacijos`
                                : operation.tipas}
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

      {selectedOperations.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-border-soft bg-white/80 p-4 text-sm">
          <p className="font-semibold">Pasirinkto laiko uzimtumas</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {selectedOperations.map((selectedOperation) => (
              <div
                key={selectedOperation.id}
                className="rounded-xl border border-border-soft bg-background/60 p-3"
              >
                <p className="font-semibold">
                  Operacine {selectedOperation.operacineNr}
                </p>
                <p className="mt-2 text-foreground/70">
                  {selectedOperation.data} {selectedOperation.pradziosLaikas},{" "}
                  {selectedOperation.tipas}, trukme {selectedOperation.trukmeMin}{" "}
                  min., busena: {selectedOperation.busena}, pacientas:{" "}
                  {selectedOperation.pacientas}.
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
