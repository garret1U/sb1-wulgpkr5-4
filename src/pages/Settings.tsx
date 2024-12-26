import React from 'react';
import { Settings as SettingsIcon, Shield, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../components/ui/Table';
import { UserProfileForm } from '../components/settings/UserProfileForm';
import { getCurrentUserProfile, getUserProfiles, updateUserRole } from '../lib/api';

export function Settings() {
  const queryClient = useQueryClient();
  const { data: currentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: getCurrentUserProfile
  });

  const { data: userProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: getUserProfiles,
    enabled: currentProfile?.role === 'admin'
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: 'admin' | 'viewer' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    }
  });

  const columns = [
    { 
      header: 'Email',
      accessorKey: 'user',
      cell: (value: any) => value?.email || 'N/A'
    },
    { header: 'Full Name', accessorKey: 'full_name' },
    { 
      header: 'Admin',
      accessorKey: 'role',
      cell: (value: string, row: any) => (
        <select
          value={value}
          onChange={(e) => updateRole({ 
            userId: row.user_id, 
            role: e.target.value as 'admin' | 'viewer'
          })}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          disabled={row.user_id === currentProfile?.user_id}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      )
    },
    {
      header: 'Last Sign In',
      accessorKey: 'user',
      cell: (value: any) => value?.last_sign_in_at ? 
        new Date(value.last_sign_in_at).toLocaleDateString() : 'Never'
    }
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <User className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Profile
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your account settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Access Level
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="capitalize">{currentProfile?.role}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Edit Profile
              </h3>
              <UserProfileForm profile={currentProfile} />
            </div>
          </div>
        </div>
      </div>

      {currentProfile?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              User Management
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage user roles and permissions
            </p>
          </div>
          
          {isLoadingProfiles ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table data={userProfiles || []} columns={columns} />
          )}
        </div>
      )}
    </div>
  );
}