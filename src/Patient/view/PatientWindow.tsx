import Link from "next/link";

const patientCards = [
  {
    title: "Vizito informacija",
    description:
      "Ateityje cia bus rodoma vizito data, priskirtas gydytojas ir atvykimo instrukcijos.",
  },
  {
    title: "Medicinine suvestine",
    description:
      "Paruosta vieta diagnozes santraukai, tyrimu rezultatams ir israsymo pastaboms.",
  },
  {
    title: "Registracijos busena",
    description:
      "Veliau cia bus galima matyti, ar pateiktos formos laukia perziuros, yra patvirtintos ar atnaujintos.",
  },
];

const routes = [
  { href: "/", label: "Pradinis" },
  { href: "/admin", label: "Administratorius" },
  { href: "/employee", label: "Darbuotojas" },
  { href: "/login", label: "Prisijungimas" },
];

export default function PatientWindow() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
      <section className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Paciento posisteme
            </p>
            <h1 className="display-font mt-3 text-4xl font-semibold sm:text-5xl">
              Paciento portalo perziura
            </h1>
            <p className="mt-4 text-base leading-7 text-foreground/72 sm:text-lg">
              Sis marsrutas atvertas testavimui be autentifikacijos ir yra
              paruostas plestis i pilna pacientui skirta aplinka.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {routes.map((item) => (
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

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {patientCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.5rem] border border-border-soft bg-white/80 p-5"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/68">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
