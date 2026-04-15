import Link from "next/link";

const doctorSections = [
  {
    title: "Siandienos tvarkarastis",
    description:
      "Vieta vizitu laikams, operaciju pasiruosimui ir operaciniu priskyrimui.",
  },
  {
    title: "Pacientu eile",
    description: "Paruosta vieta gydytojo pacientu sarasui ir prioritetams.",
  },
  {
    title: "Klinikines pastabos",
    description:
      "Paruosta vieta apziuru suvestinems, sveikimo pastaboms ir gydymo atnaujinimams.",
  },
];

const navigation = [
  { href: "/", label: "Pradinis" },
  { href: "/admin", label: "Administratorius" },
  { href: "/patient", label: "Pacientas" },
  { href: "/login", label: "Prisijungimas" },
];

export default function EmployeeWindow() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
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
              Paruostos sekcijos busimiems darbuotojo irankiams.
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

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {doctorSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-border-soft bg-white/80 p-5"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/68">
                {section.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
