'use client';

export default function GlobalHero() {
  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] py-24 md:py-36 px-6 overflow-hidden">
      {/* Earth Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop)',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest)]/95 via-[#2A4035]/90 to-[#1a2822]/95" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(129,178,154,0.4)_0%,transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(224,122,95,0.3)_0%,transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center flex flex-col justify-center min-h-[500px] md:min-h-[600px]">
        <div className="transition-all duration-500 ease-in-out transform">
          {/* Professional Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full text-lg md:text-xl font-semibold tracking-wide border border-white/20 shadow-lg">
              <span className="text-[#E07A5F]">Z Climate Change</span>
              <span className="text-white/50">×</span>
              <span className="text-secondary">Data4Earth</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight animate-fade-in leading-tight">
            Our Changing
            <br />
            Planet
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light mb-8">
            Historical data and forecasts reveal the urgent story of our climate. 
            From rising CO₂ levels to melting ice caps, the evidence is clear.
          </p>
          
          {/* Data Source Indicator */}
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Historical Data • Statistical Forecast</span>
          </div>
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

