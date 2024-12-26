import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitSelection } from './CircuitSelection';
import { SelectedCircuitsList } from './SelectedCircuitsList';
import { addProposalItem, deleteProposalItem } from '../../lib/api';
import type { Circuit, ProposalItem } from '../../types';

interface ProposalCircuitsProps {
  proposalId: string;
  companyId: string;
  items: ProposalItem[];
}

export function ProposalCircuits({ proposalId, companyId, items }: ProposalCircuitsProps) {
  const queryClient = useQueryClient();
  const [selectedCircuits, setSelectedCircuits] = useState<Circuit[]>(
    items.map(item => item.circuit)
  );

  const { mutate: addCircuit } = useMutation({
    mutationFn: (circuit: Circuit) => addProposalItem({
      proposal_id: proposalId,
      circuit_id: circuit.id,
      location_id: circuit.location_id,
      monthly_cost: circuit.monthlycost,
      installation_cost: circuit.installation_cost,
      term_months: circuit.contract_term || 12
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const { mutate: removeCircuit } = useMutation({
    mutationFn: (itemId: string) => deleteProposalItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const handleCircuitSelect = (circuit: Circuit) => {
    const isSelected = selectedCircuits.some(c => c.id === circuit.id);
    
    if (isSelected) {
      const item = items.find(i => i.circuit_id === circuit.id);
      if (item) {
        removeCircuit(item.id);
        setSelectedCircuits(prev => prev.filter(c => c.id !== circuit.id));
      }
    } else {
      addCircuit(circuit);
      setSelectedCircuits(prev => [...prev, circuit]);
    }
  };

  return (
    <div className="space-y-8">
      <CircuitSelection
        companyId={companyId}
        onSelect={handleCircuitSelect}
        selectedCircuits={selectedCircuits}
      />

      <SelectedCircuitsList
        items={items}
        onRemove={(itemId) => {
          removeCircuit(itemId);
          const item = items.find(i => i.id === itemId);
          if (item) {
            setSelectedCircuits(prev => prev.filter(c => c.id !== item.circuit_id));
          }
        }}
      />
    </div>
  );
}