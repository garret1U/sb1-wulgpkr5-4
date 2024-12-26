import React from 'react';

interface GridViewProps<T> {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
}

export function GridView<T>({ data, renderCard }: GridViewProps<T>) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div key={index} className="h-full">
            {renderCard(item)}
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No items found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}