import React from 'react';
import { Network, Gauge, DollarSign, Activity } from 'lucide-react';
import type { ProposalCircuit } from '../../types';

interface ProposalStatsProps {
  circuits: ProposalCircuit[];
  totalAvailableCircuits: number;
}

export function ProposalStats({ circuits, totalAvailableCircuits }: ProposalStatsProps) {
  // Calculate statistics
  const totalProposed = circuits?.length || 0;
  const totalBandwidth = circuits?.reduce((sum, pc) => {
    const bandwidth = parseInt(pc.circuit.bandwidth);
    return isNaN(bandwidth) ? sum : sum + bandwidth;
  }, 0);
  const totalMonthlyCost = circuits?.reduce((sum, pc) => sum + pc.circuit.monthlycost, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Available Circuits</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalAvailableCircuits}
            </p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Network className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Circuits Proposed</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalProposed}
            </p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Activity className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bandwidth</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalBandwidth} Mbps
            </p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Gauge className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Cost</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ${totalMonthlyCost.toLocaleString()}
            </p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
}