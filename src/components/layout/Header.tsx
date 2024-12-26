import React, { useState } from 'react';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile } from '../../lib/api';
import { UserProfileModal } from '../ui/UserProfileModal';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export function Header({ toggleSidebar, toggleTheme, isDarkMode }: HeaderProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: getCurrentUserProfile
  });

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md 
                     hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Set Name' : 'Set Name'}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      {profile && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
        />
      )}
    </header>
  );
}