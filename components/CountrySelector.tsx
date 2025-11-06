'use client';

interface Country {
  id: string;
  name: string;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onSelectCountry: (countryId: string) => void;
}

export default function CountrySelector({
  countries,
  selectedCountry,
  onSelectCountry,
}: CountrySelectorProps) {
  return (
    <div className="w-full bg-white/50 backdrop-blur-sm py-8 px-6 -mt-1">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm uppercase tracking-wider text-charcoal/60 font-semibold mb-4 text-center">
          Select Country
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {countries.map((country) => (
            <button
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
              className={`
                px-6 py-3 rounded-full font-medium text-base
                transition-all duration-200 ease-in-out
                transform hover:scale-105 hover:shadow-lg
                ${
                  selectedCountry === country.id
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white text-charcoal hover:bg-secondary/20 border border-secondary/30'
                }
              `}
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


