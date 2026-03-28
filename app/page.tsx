import Link from "next/link";

const actions = [
  {
    href: "/login",
    title: "Prisijungti",
    description:
      "Prisijunkite prie sistemos arba atsidarykite posistemius testavimui be autentifikacijos.",
    tone:
      "bg-accent text-white shadow-[0_18px_40px_rgba(31,122,140,0.26)] hover:bg-accent-strong",
  },
  {
    href: "/register",
    title: "Paciento registracija",
    description:
      "Užsiregistruokite pirmajam vizitui ir pateikite pradinę kontaktinę informacija.",
    tone:
      "border border-border-soft bg-white/80 text-foreground hover:border-accent/30 hover:bg-white",
  },
];

const subsystemLinks = [
  { href: "/admin", label: "Administratoriaus posistemė" },
  { href: "/doctor", label: "Gydytojo posistemė" },
  { href: "/patient", label: "Paciento posistemė" },
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-[-9rem] -z-10 h-80 bg-[radial-gradient(circle,_rgba(31,122,140,0.18),_transparent_60%)] blur-3xl" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-16">
        <section className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-accent uppercase backdrop-blur-sm">
              Cardio Ops System
            </span>
            <h1 className="display-font mt-6 text-5xl leading-tight font-semibold text-balance sm:text-6xl lg:text-7xl">
              Ligoninės širdies ligų skyriaus valdymo sistema
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/75 sm:text-xl">
              Gali rinktis prisijungimą, registraciją arba tiesiogiai
              atsidaryti posistemius testavimui be prisijungimo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-foreground/60">
              <span className="rounded-full border border-white/70 bg-white/55 px-4 py-2 backdrop-blur-sm">
                Saugi prieiga
              </span>
              <span className="rounded-full border border-white/70 bg-white/55 px-4 py-2 backdrop-blur-sm">
                Pacientų registracija
              </span>
              <span className="rounded-full border border-white/70 bg-white/55 px-4 py-2 backdrop-blur-sm">
                Skyriui pritaikyta aplinka
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(31,122,140,0.22),rgba(240,182,127,0.2))] blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-surface p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-7">
              <div className="rounded-[1.6rem] border border-border-soft bg-surface-strong p-6 sm:p-8">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                      Sveiki atvyke
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                      Pasirinkite veiksmą
                    </h2>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent shadow-inner">
                    <span className="text-2xl">+</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {actions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`group block rounded-[1.5rem] px-5 py-5 transition duration-200 sm:px-6 ${action.tone}`}
                    >
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <h3 className="text-xl font-semibold sm:text-2xl">
                            {action.title}
                          </h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-current/75 sm:text-base">
                            {action.description}
                          </p>
                        </div>
                        <span className="text-2xl transition-transform duration-200 group-hover:translate-x-1">
                          -&gt;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold tracking-[0.16em] text-foreground/55 uppercase">
                    Greita prieiga be prisijungimo
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {subsystemLinks.map((item) => (
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

                <div className="mt-6 rounded-[1.4rem] border border-border-soft bg-accent-soft/55 px-5 py-4 text-sm leading-6 text-foreground/70">
                  Skirta patogiam skyriaus darbo koordinavimui, konsultacijų
                  registracijai ir pacientų informacijos valdymui vienoje vietoje.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
