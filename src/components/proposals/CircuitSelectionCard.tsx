import React from 'react';
import { Network, Check } from 'lucide-react';
import type { Circuit } from '../../types';

interface CircuitSelectionCardProps {
  circuit: Circuit;
  isSelected: boolean;
  onSelect: () => void;
}

export function CircuitSelectionCard({ circuit, isSelected, onSelect }: CircuitSelectionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
          : 'border-gray-200 dark:border-gray-700 hover:border-primary'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {circuit.carrier}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {circuit.type} - {circuit.purpose}
            </p>
          </div>
        </div>
        
        {isSelected && (
          <div className="rounded-full bg-primary p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Bandwidth:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{circuit.bandwidth}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Monthly Cost:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">
            ${circuit.monthlycost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}