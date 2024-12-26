import React from 'react';
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md ${
          view === 'grid'
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`p-2 rounded-md ${
          view === 'table'
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}