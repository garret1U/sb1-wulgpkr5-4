import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { CountrySelect } from './CountrySelect';
import { StateSelect } from './StateSelect';
import { AddressAutocomplete } from './AddressAutocomplete';
import { validateAddress } from '../../lib/maps';
import type { AddressFormData } from '../../types';

interface AddressFormProps {
  value: AddressFormData;
  onChange: (address: AddressFormData) => void;
  error?: string;
}

export function AddressForm({ value, onChange, error }: AddressFormProps) {
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleManualToggle = () => {
    setIsAutocompleteEnabled(!isAutocompleteEnabled);
    setFocusedField(null);
    setValidationError(null);
  };

  const handleAutocompleteSelect = (address: AddressFormData) => {
    onChange(address);
    setFocusedField(null);
    setValidationError(null);
  };

  const handleFieldChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value: fieldValue } = e.target;
    onChange({ ...value, [name]: fieldValue });
    
    if (focusedField === name && !isAutocompleteEnabled) {
      const isValid = await validateAddress(value);
      setValidationError(isValid ? null : 'Please enter a valid address');
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (focusedField === e.target.name) {
      setFocusedField(null);
    }
  };

  return (
    <div className="space-y-4">
      {isAutocompleteEnabled ? (
        <>
          <AddressAutocomplete
            onSelect={handleAutocompleteSelect}
            defaultValue={value.street}
          />
          <button
            type="button"
            onClick={handleManualToggle}
            className="text-sm text-primary hover:text-primary/90"
          >
            Enter address manually
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Street Address *
            </label>
            <div className="mt-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="street"
                required
                value={value.street}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleFieldChange}
                className="pl-10 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                         focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter street address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={value.city}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                         focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <StateSelect
              value={value.state}
              onChange={(state) => onChange({ ...value, state })}
              country={value.country}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zip_code"
                required
                value={value.zip_code}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                         focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <CountrySelect
              value={value.country}
              onChange={(country) => onChange({ ...value, country })}
            />
          </div>

          <button
            type="button"
            onClick={handleManualToggle}
            className="text-sm text-primary hover:text-primary/90"
          >
            Use address autocomplete
          </button>
        </>
      )}

      {(error || validationError) && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error || validationError}
        </p>
      )}
    </div>
  );
}