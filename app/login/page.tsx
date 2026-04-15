import Link from "next/link";

const directAccessLinks = [
  { href: "/admin", label: "Open Admin" },
  { href: "/employee", label: "Open Employee" },
  { href: "/patient", label: "Open Patient" },
];

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-16">
      <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/70 bg-surface p-8 shadow-[var(--shadow)] backdrop-blur-xl sm:p-10">
          <span className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
            Prisijungimas
          </span>
          <h1 className="display-font mt-6 text-4xl leading-tight font-semibold sm:text-5xl">
            Prisijunkite prie savo paskyros
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-foreground/72 sm:text-lg">
            Gydytojai, administratoriai ir pacientai gali saugiai patekti i savo
            aplinka naudodami sistemos prisijungimo duomenis.
          </p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-foreground/62">
            Testavimo metu posistemius galima atidaryti ir be prisijungimo,
            naudojant greitos prieigos mygtukus zemiau.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-foreground/65">
            <span className="rounded-full border border-border-soft bg-white/70 px-4 py-2">
              Greita prieiga
            </span>
            <span className="rounded-full border border-border-soft bg-white/70 px-4 py-2">
              Apsaugoti duomenys
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {directAccessLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[var(--shadow)] backdrop-blur-xl sm:p-10">
          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-foreground/70"
              >
                El. pastas
              </label>
              <input
                id="email"
                type="email"
                placeholder="vardas@ligonine.lt"
                className="w-full rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-foreground/70"
              >
                Slaptazodis
              </label>
              <input
                id="password"
                type="password"
                placeholder="Iveskite slaptazodi"
                className="w-full rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white transition hover:bg-accent-strong"
            >
              Demo login disabled
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-foreground/65">
            <Link href="/" className="font-medium hover:text-accent">
              Grizti i pradzia
            </Link>
            <Link href="/register" className="font-medium hover:text-accent">
              Nauja registracija
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
