import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCircuit } from '../../lib/api';
import type { Circuit } from '../../types';
import { stopPropagation } from '../../lib/events';

interface PurposeSelectProps {
  circuit: Circuit;
}

const purposeOptions = [
  { value: 'Primary', label: 'Primary' },
  { value: 'Secondary', label: 'Secondary' },
  { value: 'Backup', label: 'Backup' }
];

export function PurposeSelect({ circuit }: PurposeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (purpose: string) => updateCircuit(circuit.id, { ...circuit, purpose }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
      setIsOpen(false);
    }
  });

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          stopPropagation(e);
          setIsOpen(!isOpen);
        }}
        className="text-gray-900 dark:text-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
      >
        {circuit.purpose}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {purposeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    stopPropagation(e);
                    mutate(option.value);
                  }}
                  className={`
                    ${circuit.purpose === option.value ? 'bg-gray-100 dark:bg-gray-600' : ''}
                    block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-600
                  `}
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}