import React from 'react';

interface LocationMarkerProps {
  criticality: string;
  selected?: boolean;
}

export function LocationMarker({ criticality, selected }: LocationMarkerProps) {
  const colors = {
    High: '#ef4444',    // red-500
    Medium: '#f59e0b',  // amber-500
    Low: '#10b981',     // emerald-500
  }[criticality] || '#6b7280'; // gray-500

  return `
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" 
              fill="${colors}"/>
        ${selected ? `
          <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" 
                fill="white" fill-opacity="0.3"/>
        ` : ''}
        <circle cx="16" cy="12" r="6" fill="white"/>
      </g>
      <defs>
        <filter id="filter0_d" x="0" y="0" width="32" height="44" filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  `;
}