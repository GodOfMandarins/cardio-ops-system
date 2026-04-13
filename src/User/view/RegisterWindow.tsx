import Link from "next/link";

const testRoutes = [
  { href: "/admin", label: "Admin" },
  { href: "/employee", label: "Employee" },
  { href: "/patient", label: "Patient" },
];

export default function RegisterWindow() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-16">
      <section className="grid w-full gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[var(--shadow)] backdrop-blur-xl sm:p-10">
          <span className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
            Paciento registracija
          </span>
          <h1 className="display-font mt-6 text-4xl leading-tight font-semibold sm:text-5xl">
            Registracija pirmajam vizitui
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-foreground/72 sm:text-lg">
            Uzpildykite pagrindine informacija, kad skyrius galetu greiciau
            suplanuoti konsultacija ir susisiekti del tolimesniu veiksmu.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {testRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-full border border-border-soft bg-white/75 px-4 py-2 text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
              >
                Open {route.label} without login
              </Link>
            ))}
          </div>

          <form className="mt-8 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Vardas"
              className="rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent"
            />
            <input
              type="text"
              placeholder="Pavarde"
              className="rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent"
            />
            <input
              type="tel"
              placeholder="Telefono numeris"
              className="rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent sm:col-span-2"
            />
            <input
              type="email"
              placeholder="El. pastas"
              className="rounded-2xl border border-border-soft bg-background/90 px-4 py-3.5 outline-none transition focus:border-accent sm:col-span-2"
            />
            <button
              type="button"
              className="rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white transition hover:bg-accent-strong sm:col-span-2"
            >
              Submit later
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-surface p-8 shadow-[var(--shadow)] backdrop-blur-xl sm:p-10">
          <div className="rounded-[1.6rem] border border-border-soft bg-surface-strong p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Kodel verta
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Aiskus kelias iki konsultacijos
            </h2>
            <div className="mt-8 space-y-4 text-sm leading-7 text-foreground/72 sm:text-base">
              <div className="rounded-2xl border border-border-soft bg-white/75 px-5 py-4">
                Greitesnis pirminiu duomenu surinkimas dar pries susisiekima.
              </div>
              <div className="rounded-2xl border border-border-soft bg-white/75 px-5 py-4">
                Patogesnis registracijos procesas pacientui ir personalui.
              </div>
              <div className="rounded-2xl border border-border-soft bg-white/75 px-5 py-4">
                Vieningas patekimas i visa sirdies ligu skyriaus sistema.
              </div>
            </div>

            <div className="mt-8 text-sm text-foreground/65">
              Jau turite paskyra?{" "}
              <Link
                href="/user/login"
                className="font-semibold text-accent hover:text-accent-strong"
              >
                Prisijunkite
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
