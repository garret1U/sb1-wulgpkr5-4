import React from 'react';
import { useDrop } from 'react-dnd';
import { DraggableCircuitCard } from './DraggableCircuitCard';
import { ProposedCircuitCard } from './ProposedCircuitCard';
import type { Location, Circuit } from '../../types';

interface LocationCircuitsProps {
  location: Location;
  onCircuitAdd: (circuit: Circuit) => void;
  onCircuitRemove: (circuitId: string) => void;
  proposedCircuits: Circuit[];
}

export function LocationCircuits({
  location,
  onCircuitAdd,
  onCircuitRemove,
  proposedCircuits
}: LocationCircuitsProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'circuit',
    drop: (item: Circuit) => {
      onCircuitAdd(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
      {/* Available Circuits */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Available Options
        </h4>
        <div className="space-y-3">
          {/* Example circuits - replace with actual data */}
          <DraggableCircuitCard
            circuit={{
              id: 'att-1',
              carrier: 'AT&T',
              type: 'DIA',
              bandwidth: '1000 Mbps',
              monthlycost: 1100,
              status: 'Quoted',
              purpose: 'Primary',
              location_id: location.id
            }}
          />
          <DraggableCircuitCard
            circuit={{
              id: 'vz-1',
              carrier: 'Verizon',
              type: 'MPLS',
              bandwidth: '1000 Mbps',
              monthlycost: 1300,
              status: 'Quoted',
              purpose: 'Primary',
              location_id: location.id
            }}
          />
        </div>
      </div>

      {/* Proposed Circuits Drop Zone */}
      <div
        ref={drop}
        className={`
          space-y-4 p-4 rounded-lg border-2 border-dashed
          ${isOver 
            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
            : 'border-gray-200 dark:border-gray-700'}
        `}
      >
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Proposed Circuits
        </h4>
        <div className="space-y-3">
          {proposedCircuits.map((circuit) => (
            <ProposedCircuitCard
              key={circuit.id}
              circuit={circuit}
              onRemove={() => onCircuitRemove(circuit.id)}
            />
          ))}
          {proposedCircuits.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Drag circuits here to add them to your proposal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}