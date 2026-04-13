"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  OperatingRoomFormData,
  OperatingRoomListItem,
} from "@/src/Models/OperatingRoom";

const initialForm: OperatingRoomFormData = {
  atliekamosOperacijosTipas: "Revaskuliarizacine operacija",
};

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

export default function OperatingRoomWindow() {
  const [rooms, setRooms] = useState<OperatingRoomListItem[]>([]);
  const [formData, setFormData] = useState<OperatingRoomFormData>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void openOperatingRoomForm();
  }, []);

  async function loadOperatingRooms() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/operating-rooms", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: OperatingRoomListItem[];
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Nepavyko uzkrauti operaciniu.");
      }

      setRooms(payload.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nepavyko uzkrauti operaciniu."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openOperatingRoomForm() {
    void loadOperatingRooms();
  }

  function initiateOperatingRoomFormOpening() {
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
      const response = await fetch("/api/admin/operating-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: OperatingRoomListItem;
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Nepavyko issaugoti operacines.");
      }

      const createdRoom = payload.data;
      setRooms((current) => [createdRoom, ...current]);
      setMessage("Operacine sekmingai prideta.");

      setTimeout(() => {
        handleCloseDialog();
      }, 500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nepavyko issaugoti operacines."
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
            Operacines
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Operaciniu vadyba
          </h2>
          <p className="mt-4 text-base leading-7 text-foreground/72">
            Čia galite matyti ir pridėti naujas operacines.
          </p>
        </div>

        <button
          onClick={() => void initiateOperatingRoomFormOpening()}
          className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong whitespace-nowrap"
        >
          + Pridėti operacinę
        </button>
      </div>

      {/* PAGRINDINIS TURINYS - OPERACINIŲ SĄRAŠAS */}
      <div className="rounded-[1.6rem] border border-border-soft bg-white/80 p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
              Operaciniu sarasas
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Esamos operacines</h3>
          </div>
          <button
            type="button"
            onClick={() => void initiateOperatingRoomFormOpening()}
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
                <th className="text-left px-4 py-3 font-semibold text-foreground">Nr.</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Operacijos tipas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-foreground/65">
                    Kraunama...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-foreground/65">
                    Operaciniu sarasas tuscias.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.nr}
                    className="border-b border-border-soft/50 hover:bg-background/30 transition"
                  >
                    <td className="px-4 py-4 font-medium">{room.nr}</td>
                    <td className="px-4 py-4">{room.atliekamosOperacijosTipas}</td>
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
          <h3 className="text-2xl font-semibold mb-2">Pridėti naują operacinę</h3>
          <p className="text-foreground/65 mb-6">Pasirinkite operacijos tipą</p>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <select
                value={formData.atliekamosOperacijosTipas}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    atliekamosOperacijosTipas: event.target.value as OperatingRoomFormData["atliekamosOperacijosTipas"],
                  }))
                }
                className="w-full rounded-xl border border-border-soft bg-background/90 px-4 py-3 outline-none transition focus:border-accent"
              >
                {OPERATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
