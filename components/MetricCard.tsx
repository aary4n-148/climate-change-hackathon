'use client';

import {
  Thermometer,
  Shield,
  Users,
  AlertTriangle,
  AlertCircle,
  Wind,
  TrendingUp,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  icon?: string;
}

const iconMap = {
  thermometer: Thermometer,
  shield: Shield,
  users: Users,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  wind: Wind,
  'trending-up': TrendingUp,
};

export default function MetricCard({ label, value, icon = 'thermometer' }: MetricCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Thermometer;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-secondary/20 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-secondary/10 rounded-lg">
          <IconComponent className="w-6 h-6 text-secondary" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-sm text-charcoal/60 uppercase tracking-wider font-semibold mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-charcoal">
        {value}
      </p>
    </div>
  );
}

