"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="animate-fade-in-up max-w-2xl">
          <p className="text-sm tracking-widest uppercase text-accent mb-8 font-medium">
            4 AI models &middot; zero fluff
          </p>

          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl leading-[1.05] mb-8 text-text-primary">
            Get your profile{" "}
            <span className="italic relative inline-block">
              reviewed
              <svg
                className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)]"
                viewBox="0 0 200 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="100"
                  cy="40"
                  rx="95"
                  ry="35"
                  stroke="#5C3D6E"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-md mx-auto mb-12 leading-relaxed">
            Drop your Hinge screenshots, pick who&apos;s judging you, and get
            honest feedback from Claude, ChatGPT, Gemini, and Grok. No filter.
          </p>

          <Link
            href="/review"
            className="inline-flex items-center gap-3 px-8 py-4 bg-text-primary text-bg-primary font-medium rounded-full text-base transition-all duration-300 hover:bg-accent hover:scale-[1.02]"
          >
            Let&apos;s go
            <svg
              className="w-4 h-4"
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
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm tracking-widest uppercase text-accent mb-4 font-medium">
            How it works
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl mb-16">
            Dead simple.<br />
            <span className="italic">Stupidly honest.</span>
          </h2>

          <div className="space-y-0">
            {[
              {
                num: "01",
                title: "Drop your screenshots",
                desc: "Screenshot your Hinge profile. Up to 6 images.",
              },
              {
                num: "02",
                title: "Pick your reviewer",
                desc: "Set their age, city, vibe – or write the whole persona yourself. More specific = better feedback.",
              },
              {
                num: "03",
                title: "Get roasted",
                desc: "4 AI models review you independently. No shared context, no averaging out.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className={`flex gap-8 py-10 ${i < 2 ? "border-b border-border" : ""}`}
              >
                <span className="text-sm font-mono text-text-muted pt-1">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed max-w-md">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-border text-center text-text-muted text-sm">
        AI-generated reviews. Grain of salt, glass of wine.
      </footer>
    </main>
  );
}
