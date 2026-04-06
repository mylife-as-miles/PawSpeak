const featureCards = [
  {
    title: "Translate everyday phrases",
    body: "Turn a simple message into playful cat-style phrasing for fun, sharing, and experiments.",
  },
  {
    title: "Understand cat patterns",
    body: "PawSpeak is designed around repeated moments so you can notice moods, habits, and signals faster.",
  },
  {
    title: "Save favorite moments",
    body: "Keep the best meows, reactions, and cat conversations in one place as the product grows.",
  },
];

const apiEndpoints = [
  "/api/pawspeak/translate",
  "/api/pawspeak/transcribe",
  "/api/pawspeak/speak",
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,140,0,0.24),_transparent_42%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <img
                src="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                alt="PawSpeak cat"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm font-semibold tracking-[0.18em] text-white/80 uppercase">
                PawSpeak
              </span>
            </div>

            <a
              href="#details"
              className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 md:inline-flex"
            >
              Learn more
            </a>
          </div>

          <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#FF8C00]">
                Cat translation, reimagined
              </p>

              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl">
                Finally.
                <span className="block text-[#FF8C00]">Speak Cat.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
                PawSpeak is a playful cat-language experience built to help people
                translate phrases, explore cat moods, and save the moments that
                make their pets feel unforgettable.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#details"
                  className="inline-flex items-center justify-center rounded-full bg-[#FF8C00] px-7 py-4 text-base font-bold text-white transition hover:brightness-110"
                >
                  Explore PawSpeak
                </a>
                <a
                  href="#api"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-4 text-base font-bold text-white transition hover:bg-white/10"
                >
                  View API routes
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {["Mobile onboarding in progress", "Web root restored", "API routes available"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/72"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="relative flex justify-center md:justify-end">
              <div className="absolute inset-x-8 top-10 h-72 rounded-full bg-[#FF8C00]/15 blur-3xl md:inset-x-16" />
              <div className="relative flex h-[26rem] w-full max-w-[28rem] items-end justify-center rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <img
                  src="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                  alt="PawSpeak mascot"
                  className="h-full w-full object-contain"
                />

                <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/10 bg-[#181818]/90 p-5 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                        Brand promise
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">
                        Translate your words into purrs, meows, and playful cat energy.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#FF8C00]/18 px-4 py-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFD2A0]">
                        Rating
                      </p>
                      <p className="mt-1 text-2xl font-black text-white">4.6</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="details" className="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF8C00]">
                Feature
              </p>
              <h2 className="mt-4 text-2xl font-black text-white">{card.title}</h2>
              <p className="mt-3 text-base leading-7 text-white/68">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="api"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16 pt-8 md:px-10 md:pb-24"
      >
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF8C00]">
            Developer routes
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">Current web surface</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">
            The main web homepage is now restored. These API routes already exist in
            the project and can be connected to product flows as deployment is finalized.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {apiEndpoints.map((endpoint) => (
              <code
                key={endpoint}
                className="rounded-2xl border border-white/10 bg-[#171717] px-4 py-4 text-sm font-semibold text-white/80"
              >
                {endpoint}
              </code>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
