import Link from "next/link";

const subsystemLinks = [
  { href: "/admin", label: "Administratorius" },
  { href: "/doctor", label: "Gydytojas" },
  { href: "/patient", label: "Pacientas" },
  { href: "/login", label: "Prisijungimas" },
];

const quickStats = [
  { label: "Laukiantys užklausimai", value: "14", hint: "Elementai, laukiantys peržiūros" },
  { label: "Suplanuotos operacijos", value: "08", hint: "Numatytos šiai savaitei" },
  { label: "Laisvos operacinės", value: "03", hint: "Paruoštos priskyrimui" },
];

const functionGroups = [
  {
    title: "Žmones ir prieiga",
    description:
      "Pagrindiniai administratoriaus veiksmai darbuotojų registravimui ir pacientų patekimo valdymui.",
    items: [
      {
        name: "Register Employee",
        detail:
          "Sukurti darbuotojo profilį, priskirti skyriaus rolę ir paruošti paskyros suteikimą.",
      },
      {
        name: "Register Patient Visit",
        detail:
          "Užregistruoti vizito užklausą, nukreipti pacientą į tinkamą eigą ir prideti prioriteto pastabas.",
      },
    ],
  },
  {
    title: "Operacijų valdymas",
    description:
      "Atskira sritis operacijų planavimui, operacinių administravimui, redagavimui ir rezultatų fiksavimui.",
    items: [
      {
        name: "Add Operating Room",
        detail:
          "Valdyti operacinių sąrašą, jų užimtumą ir įrangos parengties būseną.",
      },
      {
        name: "Add Operation",
        detail:
          "Sukurti naują operacijos įrašą su planavimo galimybe ir gydytojo parinkimo logika ateičiai.",
      },
      {
        name: "Edit Operation",
        detail:
          "Koreguoti paskirtas komandas, operacinės duomenis, laiką ir susietą paciento informaciją.",
      },
      {
        name: "Cancel Operation",
        detail:
          "Suteikti saugų operacijos atšaukimo kelią su vieta priežastims ir veiksmų istorijai ateityje.",
      },
      {
        name: "Record Operation Results",
        detail:
          "Išsaugoti pooperacinius rezultatus, pastabas, sveikimo būseną ir galutines medicinines išvadas.",
      },
    ],
  },
  {
    title: "Organai ir transplantacijos eiga",
    description:
      "Specializuoti moduliai, paruošti vėlesnei transplantacijos eigai ir donorų koordinavimui.",
    items: [
      {
        name: "Register Received Organ",
        detail:
          "Registruoti gauto organo duomenis, kilmės informaciją, laikus ir saugojimo duomenis.",
      },
      {
        name: "Match Organ Donation",
        detail:
          "Paruošti sąsają suderinamumo peržiūrai, recipiento parinkimui ir tvirtinimo etapams.",
      },
    ],
  },
];

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10 lg:px-16">
      <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="rounded-[1.6rem] bg-[linear-gradient(145deg,rgba(31,122,140,0.16),rgba(255,255,255,0.95))] p-5">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Administratoriaus skydelis
            </p>
            <h1 className="display-font mt-3 text-3xl leading-tight font-semibold">
              Kardiologijos skyriaus administratoriaus posistemė
            </h1>
            <p className="mt-4 text-sm leading-6 text-foreground/72">
              Administratoriaus veiksmams,
              procesams ir analitikai.
            </p>
          </div>

          <nav className="mt-6 space-y-3">
            <a
              href="#overview"
              className="block rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Apžvalga
            </a>
            <a
              href="#functions"
              className="block rounded-2xl border border-border-soft bg-white/75 px-4 py-3 text-sm font-medium transition hover:border-accent/30 hover:bg-white"
            >
              Funkcijų katalogas
            </a>
          </nav>

          <div className="mt-6 rounded-[1.6rem] border border-border-soft bg-white/70 p-5">
            <p className="text-sm font-semibold text-foreground">Pagrindiniai keliai</p>
            <div className="mt-4 space-y-3">
              <Link
                href="/"
                className="block rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Grįžti į pradinį puslapį
              </Link>
              <Link
                href="/login"
                className="block rounded-2xl border border-border-soft px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
              >
                Atidaryti prisijungimo puslapį
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-border-soft bg-white/70 p-5">
            <p className="text-sm font-semibold text-foreground">
              Posistemių perjungimas
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {subsystemLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border-soft px-4 py-3 text-center text-sm font-semibold transition hover:border-accent/30 hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          <div
            id="overview"
            className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                  Apžvalga
                </p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Administravimo aplinka
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
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
          </div>

          <div
            id="functions"
            className="rounded-[2rem] border border-white/70 bg-surface p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                  Funkcijų katalogas
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  Administratoriaus funkcijos
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {functionGroups.map((group) => (
                <section key={group.title}>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{group.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-foreground/65">
                      {group.description}
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {group.items.map((item) => (
                      <article
                        key={item.name}
                        className="rounded-[1.5rem] border border-border-soft bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white"
                      >
                        <div>
                          <h4 className="text-xl font-semibold">{item.name}</h4>
                          <p className="mt-2 text-sm leading-6 text-foreground/70">
                            {item.detail}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
                          >
                            Atidaryti modulį
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold transition hover:border-accent/30 hover:bg-background"
                          >
                            Konfiguruoti vėliau
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
