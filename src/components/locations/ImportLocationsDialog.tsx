import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { parseLocationsCsv } from '../../lib/excel';
import type { Location } from '../../types';

interface ImportLocationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (locations: Partial<Location>[]) => void;
}

export function ImportLocationsDialog({ isOpen, onClose, onImport }: ImportLocationsDialogProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      const locations = await parseLocationsCsv(file);
      onImport(locations);
      onClose();
    } catch (error) {
      console.error('Failed to import locations:', error);
      alert('Failed to import locations. Please check the file format.');
    }
  }, [onImport, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Locations">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-gray-600 dark:text-gray-300">Drop the file here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                Drag and drop a CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                File should match the export format
              </p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-2">Required columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Name</li>
            <li>Address</li>
            <li>City</li>
            <li>State</li>
            <li>ZIP Code</li>
            <li>Country</li>
            <li>Criticality</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}