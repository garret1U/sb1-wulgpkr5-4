import React from 'react';
import { X } from 'lucide-react';
import type { ProposalItem } from '../../types';

interface SelectedCircuitsListProps {
  items: ProposalItem[];
  onRemove: (itemId: string) => void;
}

export function SelectedCircuitsList({ items, onRemove }: SelectedCircuitsListProps) {
  if (items.length === 0) return null;

  const totalMonthlyCost = items.reduce((sum, item) => sum + item.monthly_cost, 0);
  const totalInstallationCost = items.reduce((sum, item) => sum + item.installation_cost, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Selected Circuits
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 
                     dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {item.circuit.carrier}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.circuit.type} - {item.location.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${item.monthly_cost.toLocaleString()}/mo
                </p>
                {item.installation_cost > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${item.installation_cost.toLocaleString()} install
                  </p>
                )}
              </div>

              <button
                onClick={() => onRemove(item.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full 
                         hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Monthly Cost:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${totalMonthlyCost.toLocaleString()}/mo
          </span>
        </div>
        {totalInstallationCost > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500 dark:text-gray-400">Total Installation Cost:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${totalInstallationCost.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}