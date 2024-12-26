import React from 'react';
import { useDrag } from 'react-dnd';
import { Network } from 'lucide-react';
import type { Circuit } from '../../types';

interface DraggableCircuitCardProps {
  circuit: Circuit;
}

export function DraggableCircuitCard({ circuit }: DraggableCircuitCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'circuit',
    item: circuit,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`
        p-4 rounded-lg border cursor-move transition-all
        ${isDragging 
          ? 'opacity-50' 
          : 'border-gray-200 dark:border-gray-700 hover:border-primary'}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Network className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {circuit.carrier}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {circuit.type} - {circuit.bandwidth}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Monthly Cost</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          ${circuit.monthlycost.toLocaleString()}/mo
        </span>
      </div>
    </div>
  );
}