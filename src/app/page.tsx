"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-fade-in-up max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-rose animate-pulse-glow" />
            4 AI models, zero sugar-coating
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Get your Hinge profile{" "}
            <span className="bg-gradient-to-r from-accent-rose via-accent-pink to-accent-blush bg-clip-text text-transparent">
              roasted
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-lg mx-auto mb-10">
            Upload your screenshots. Pick a reviewer persona. Get brutally
            honest feedback from Claude, ChatGPT, Gemini, and Grok — all at
            once.
          </p>

          <Link
            href="/review"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-rose hover:bg-accent-pink text-white font-semibold rounded-2xl text-lg transition-all duration-300 hover:scale-105 glow-accent"
          >
            Review My Profile
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-glass-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload",
                desc: "Screenshot your Hinge profile and upload up to 6 images.",
              },
              {
                step: "02",
                title: "Pick a reviewer",
                desc: "Define who's reviewing you — age, city, vibe — or write your own persona.",
              },
              {
                step: "03",
                title: "Get roasted",
                desc: "4 AI models review your profile independently. No averaging, no bias.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 glass-card-hover">
                <div className="text-accent-rose font-mono text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-glass-border text-center text-text-muted text-sm">
        <p>
          Built for better dating profiles. AI-generated reviews — take with a
          grain of salt and a glass of wine.
        </p>
      </footer>
    </main>
  );
}
