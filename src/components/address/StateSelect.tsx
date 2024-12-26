import React from 'react';
import { states } from '../../data/states';

interface StateSelectProps {
  value: string;
  onChange: (state: string) => void;
  country: string;
}

export function StateSelect({ value, onChange, country }: StateSelectProps) {
  const countryStates = states[country] || [];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        State/Province *
      </label>
      {countryStates.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a state</option>
          {countryStates.map(state => (
            <option key={state.code} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter state/province"
        />
      )}
    </div>
  );
}