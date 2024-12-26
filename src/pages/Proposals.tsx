import React, { useState } from 'react';
import { FileText, Plus, Edit2, X, Trash2, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../components/ui/Table';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirmationDialog } from '../components/ui/DeleteConfirmationDialog';
import { ProposalForm } from '../components/proposals/ProposalForm';
import { ProposalEditForm } from '../components/proposals/ProposalEditForm';
import { ProposalDevelopment } from '../components/proposals/ProposalDevelopment';
import { getProposals, deleteProposal, getCompanies } from '../lib/api';
import type { Proposal } from '../types';

const getColumns = (onEdit: (proposal: Proposal) => void, onDelete: (proposal: Proposal) => void) => [
  { header: 'Name', accessorKey: 'name' },
  { 
    header: 'Company',
    accessorKey: 'company',
    cell: (value: any) => value?.name || 'N/A'
  },
  { 
    header: 'Status',
    accessorKey: 'status',
    cell: (value: string) => {
      const colors = {
        Draft: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
        Pending: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        Approved: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        Rejected: 'text-red-500 bg-red-50 dark:bg-red-900/20'
      }[value] || 'text-gray-500 bg-gray-100';

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
          {value}
        </span>
      );
    }
  },
  {
    header: 'Valid Until',
    accessorKey: 'valid_until',
    cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
  },
  {
    header: '',
    accessorKey: 'id',
    cell: (_: string, row: Proposal) => (
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

export function Proposals() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<Proposal | null>(null);

  const hasFilters = search || companyFilter || statusFilter;

  const clearFilters = () => {
    setSearch('');
    setCompanyFilter('');
    setStatusFilter('');
  };

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', { search, company_id: companyFilter, status: statusFilter }],
    queryFn: () => getProposals(companyFilter)
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const { mutate: deleteProposalMutation } = useMutation({
    mutationFn: (id: string) => deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setDeletingProposal(null);
    }
  });

  const companyOptions = React.useMemo(() => {
    return (companies || []).map(company => ({
      value: company.id,
      label: company.name
    }));
  }, [companies]);

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Proposals</h1>
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90
                     flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Proposal</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search proposals..."
            />
          </div>
          <div className="flex space-x-4">
            <FilterDropdown
              value={companyFilter}
              onChange={setCompanyFilter}
              options={companyOptions}
              label="All Companies"
            />
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="All Statuses"
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Proposal"
      >
        <ProposalForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingProposal}
        onClose={() => setEditingProposal(null)}
        title="Edit Proposal"
      >
        {editingProposal && (
          <ProposalEditForm
            proposal={editingProposal}
            onClose={() => setEditingProposal(null)}
          />
        )}
      </Modal>

      <DeleteConfirmationDialog
        isOpen={!!deletingProposal}
        onClose={() => setDeletingProposal(null)}
        onConfirm={() => deletingProposal && deleteProposalMutation(deletingProposal.id)}
        title={`Delete ${deletingProposal?.name}`}
        description={`Are you sure you want to delete this proposal? This action cannot be undone.`}
      />

      <div className="space-y-6">
        {/* Proposal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {proposals?.map((proposal) => (
            <div
              key={proposal.id}
              onClick={() => {
                setSelectedProposal(selectedProposal?.id === proposal.id ? null : proposal);
              }}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedProposal?.id === proposal.id 
                  ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {proposal.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProposal(proposal);
                    }}
                    className="p-1 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProposal(proposal);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full 
                             hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {proposal.company?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${proposal.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      proposal.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
                      proposal.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'}
                  `}>
                    {proposal.status}
                  </span>
                  {proposal.valid_until && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Valid until {new Date(proposal.valid_until).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Development View */}
        {isLoading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {!isLoading && selectedProposal && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <ProposalDevelopment
              proposalId={selectedProposal.id}
              companyId={selectedProposal.company_id}
              locations={selectedProposal.locations || []}
            />
          </div>
        )}
      </div>
    </div>
  );
}