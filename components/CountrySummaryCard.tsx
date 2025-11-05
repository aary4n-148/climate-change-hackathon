'use client';

interface CountrySummaryCardProps {
  countryName: string;
  countryCode: string;
  summary: string;
}

export default function CountrySummaryCard({
  countryName,
  countryCode,
  summary,
}: CountrySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-primary">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-tertiary rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {countryCode}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-charcoal mb-1">
            {countryName}
          </h2>
          <p className="text-sm text-charcoal/60 uppercase tracking-wider font-semibold">
            Climate Impact Overview
          </p>
        </div>
      </div>
      <p className="text-lg text-charcoal/80 leading-relaxed">
        {summary}
      </p>
    </div>
  );
}

