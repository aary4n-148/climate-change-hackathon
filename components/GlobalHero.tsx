'use client';

export default function GlobalHero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[var(--color-forest)] to-[#2A4035] py-24 md:py-36 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(129,178,154,0.3)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(224,122,95,0.2)_0%,transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="transition-all duration-500 ease-in-out transform">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-primary/20 text-cream rounded-full text-sm font-semibold uppercase tracking-wider border border-primary/30">
              Global Climate Status
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in">
            Our Changing Planet
          </h1>
          <p className="text-xl md:text-2xl text-cream/90 max-w-4xl mx-auto leading-relaxed font-light">
            Real-time data reveals the urgent story of our climate. 
            From rising CO₂ levels to melting ice caps, the evidence is clear.
          </p>
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 md:h-20 text-cream"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C360,96 720,96 1080,64 C1260,48 1320,32 1440,48 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

