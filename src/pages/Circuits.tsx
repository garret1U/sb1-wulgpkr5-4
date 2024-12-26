import React, { useState, useMemo, useEffect } from 'react';
import { Network, Plus, Edit2, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../components/ui/Table';
import { GridView } from '../components/ui/GridView';
import { ViewToggle } from '../components/ui/ViewToggle';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirmationDialog } from '../components/ui/DeleteConfirmationDialog';
import { CircuitForm } from '../components/circuits/CircuitForm';
import { PurposeSelect } from '../components/circuits/PurposeSelect';
import { CircuitCard } from '../components/circuits/CircuitCard';
import { useFilterPersistence } from '../contexts/FilterPersistenceContext';
import { CircuitEditForm } from '../components/circuits/CircuitEditForm';
import { getCircuits, getLocations, deleteCircuit } from '../lib/api';
import type { Circuit } from '../types';

const getColumns = (onEdit: (circuit: Circuit) => void, onDelete: (circuit: Circuit) => void) => [
  { header: 'Carrier', accessorKey: 'carrier' },
  { header: 'Type', accessorKey: 'type' },
  {
    header: 'Purpose',
    accessorKey: 'purpose',
    cell: (_: string, row: Circuit) => <PurposeSelect circuit={row} />
  },
  { header: 'Status', accessorKey: 'status' },
  { header: 'Bandwidth', accessorKey: 'bandwidth' },
  { 
    header: 'Monthly Cost',
    accessorKey: 'monthlycost',
    cell: (value: number) => `$${value.toLocaleString()}`
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: (value: any) => `${value.name} (${value.company.name})`,
  },
  {
    header: '',
    accessorKey: 'id',
    cell: (_: string, row: Circuit) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4 text-gray-400 hover:text-primary" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    )
  }
];

export function Circuits() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<Circuit | null>(null);
  const [deletingCircuit, setDeletingCircuit] = useState<Circuit | null>(null);
  const { isPersistent, getFilters, setFilters } = useFilterPersistence();
  
  const savedFilters = getFilters('circuits');
  const [search, setSearch] = useState(savedFilters.search || '');
  const [carrierFilter, setCarrierFilter] = useState(savedFilters.carrier || '');
  const [typeFilter, setTypeFilter] = useState(savedFilters.type || '');
  const [statusFilter, setStatusFilter] = useState(savedFilters.status || '');
  const [locationFilter, setLocationFilter] = useState(savedFilters.location || '');

  const hasFilters = search || carrierFilter || typeFilter || statusFilter || locationFilter;

  // Update persisted filters when they change
  useEffect(() => {
    if (isPersistent) {
      setFilters('circuits', {
        search,
        carrier: carrierFilter,
        type: typeFilter,
        status: statusFilter,
        location: locationFilter
      });
    }
  }, [isPersistent, search, carrierFilter, typeFilter, statusFilter, locationFilter, setFilters]);

  const clearFilters = () => {
    setSearch('');
    setCarrierFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setLocationFilter('');
    if (isPersistent) {
      setFilters('circuits', {});
    }
  };

  const { data: circuits, isLoading } = useQuery({
    queryKey: ['circuits', { search, carrier: carrierFilter, type: typeFilter, status: statusFilter, location_id: locationFilter }],
    queryFn: () => getCircuits({ 
      search,
      carrier: carrierFilter,
      type: typeFilter,
      status: statusFilter,
      location_id: locationFilter
    })
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations()
  });

  const { mutate: deleteCircuitMutation } = useMutation({
    mutationFn: (id: string) => deleteCircuit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
      setDeletingCircuit(null);
    }
  });

  const filters = useMemo(() => {
    if (!circuits) return { carriers: [], types: [], statuses: [] };

    const carriers = [...new Set(circuits.map(c => c.carrier))].sort().map(carrier => ({
      value: carrier,
      label: carrier
    }));

    const types = [...new Set(circuits.map(c => c.type))].sort().map(type => ({
      value: type,
      label: type
    }));

    const statuses = [...new Set(circuits.map(c => c.status))].sort().map(status => ({
      value: status,
      label: status
    }));

    return { carriers, types, statuses };
  }, [circuits]);

  const locationOptions = useMemo(() => {
    return (locations || []).map(location => ({
      value: location.id,
      label: `${location.name} (${location.company?.name})`
    }));
  }, [locations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Circuits</h1>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-4 flex items-center space-x-1 px-2 py-1 text-sm text-gray-500 
                         hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                         bg-gray-100 dark:bg-gray-700 rounded-md"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ViewToggle view={view} onViewChange={setView} />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90
                       flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Circuit</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search circuits..."
            />
          </div>
          <div className="flex space-x-4">
            <FilterDropdown
              value={carrierFilter}
              onChange={setCarrierFilter}
              options={filters.carriers}
              label="All Carriers"
            />
            <FilterDropdown
              value={typeFilter}
              onChange={setTypeFilter}
              options={filters.types}
              label="All Types"
            />
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={filters.statuses}
              label="All Statuses"
            />
            <FilterDropdown
              value={locationFilter}
              onChange={setLocationFilter}
              options={locationOptions}
              label="All Locations"
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Circuit"
      >
        <CircuitForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingCircuit}
        onClose={() => setEditingCircuit(null)}
        title="Edit Circuit"
      >
        {editingCircuit && (
          <CircuitEditForm
            circuit={editingCircuit}
            onClose={() => setEditingCircuit(null)}
          />
        )}
      </Modal>

      <DeleteConfirmationDialog
        isOpen={!!deletingCircuit}
        onClose={() => setDeletingCircuit(null)}
        onConfirm={() => deletingCircuit && deleteCircuitMutation(deletingCircuit.id)}
        title={`Delete ${deletingCircuit?.carrier} Circuit`}
        description={`Are you sure you want to delete the ${deletingCircuit?.carrier} circuit at ${deletingCircuit?.location?.name}?`}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          view === 'table' ? (
            <Table
              data={circuits || []}
              columns={getColumns(setEditingCircuit, setDeletingCircuit)}
              onRowClick={setEditingCircuit}
            />
          ) : (
            <GridView
              data={circuits || []}
              renderCard={(circuit) => (
                <div
                  onClick={() => setEditingCircuit(circuit)}
                  className="cursor-pointer"
                >
                  <CircuitCard circuit={circuit} />
                </div>
              )}
            />
          )
        )}
      </div>
    </div>
  );
}