import React from 'react';
import { countries } from '../../data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Country *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">Select a country</option>
        {countries.map(country => (
          <option key={country.code} value={country.name}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}