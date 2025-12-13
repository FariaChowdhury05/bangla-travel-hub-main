import React from "react";

interface FacilityBadgeProps {
  name: string;
  description?: string | null;
  isAvailable?: boolean;
}

export default function FacilityBadge({ name, description, isAvailable = true }: FacilityBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md px-3 py-2 border transition-colors text-sm ${
        isAvailable ? 'bg-white/80 border-gray-200 text-gray-900' : 'bg-gray-50 border-gray-100 text-gray-400'
      }`}
      title={description ?? ''}
      aria-label={name}
    >
      <span className="flex-none w-6 h-6">
        {isAvailable ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-green-500">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="opacity-20" />
            <path d="M8 12.5l2 2 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-300">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" className="opacity-30" />
            <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      <div className="truncate">
        <div className={`font-medium leading-tight ${isAvailable ? '' : 'line-through'}`}>{name}</div>
        {description ? <div className="text-xs text-muted-foreground truncate">{description}</div> : null}
      </div>
    </div>
  );
}
