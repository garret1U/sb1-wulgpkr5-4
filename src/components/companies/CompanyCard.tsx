import React from 'react';
import { Building2, Mail, Phone, Globe, MapPin, ChevronRight } from 'lucide-react';
import type { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                  transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary">
                {company.name}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{company.address_city}, {company.address_state}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary 
                                transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Contact Details */}
      <div className="p-6 pt-4 space-y-3">
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate">
              {company.street_address}, {company.address_city}, {company.address_state} {company.address_zip}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{company.phone}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{company.email}</span>
          </div>
        </div>

        {company.website && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 min-w-0">
              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a 
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 
                    transition-opacity pointer-events-none" />
    </div>
  );
}