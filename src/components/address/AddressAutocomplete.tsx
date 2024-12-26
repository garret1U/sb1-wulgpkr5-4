import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchAddress } from '../../lib/maps';
import type { AddressFormData } from '../../types';

interface AddressAutocompleteProps {
  onSelect: (address: AddressFormData) => void;
  defaultValue?: string;
}

export function AddressAutocomplete({ onSelect, defaultValue = '' }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AddressFormData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchAddress(debouncedQuery).then(results => {
        setSuggestions(results);
        setIsOpen(results.length > 0);
      });
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (address: AddressFormData) => {
    setQuery(address.street);
    onSelect(address);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Start typing to search addresses..."
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 
                     py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {suggestions.map((address, index) => (
            <li
              key={index}
              onClick={() => handleSelect(address)}
              className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-100">{address.street}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {address.city}, {address.state} {address.zip_code}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}