import { Location } from '../types';

export function exportToExcel(locations: Location[]) {
  // Create CSV content with all fields
  const headers = [
    'Name',
    'Address',
    'City',
    'State',
    'ZIP Code',
    'Country',
    'Criticality',
    'Site Description',
    'Critical Processes',
    'Active Users',
    'Number of Servers',
    'Number of Devices',
    'Hosted Applications',
    'Company'
  ];

  const rows = locations.map(location => [
    location.name,
    location.address,
    location.city,
    location.state,
    location.zip_code,
    location.country,
    location.criticality,
    location.site_description || '',
    location.critical_processes || '',
    location.active_users || 0,
    location.num_servers || 0,
    location.num_devices || 0,
    location.hosted_applications || '',
    location.company?.name || ''
  ]);

  // Properly escape and quote CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Convert to string and handle null/undefined
        const value = cell?.toString() || '';
        // Quote if contains comma, newline, or quotes
        return value.includes(',') || value.includes('\n') || value.includes('"')
          ? `"${value.replace(/"/g, '""')}"` // Escape quotes by doubling them
          : value;
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `locations_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseLocationsCsv(file: File): Promise<Partial<Location>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const locations = lines.slice(1)
          .filter(line => line.trim()) // Skip empty lines
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const location: any = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              switch (header) {
                case 'Name':
                  location.name = value;
                  break;
                case 'Address':
                  location.address = value;
                  break;
                case 'City':
                  location.city = value;
                  break;
                case 'State':
                  location.state = value;
                  break;
                case 'ZIP Code':
                  location.zip_code = value;
                  break;
                case 'Country':
                  location.country = value;
                  break;
                case 'Criticality':
                  location.criticality = value;
                  break;
                case 'Site Description':
                  location.site_description = value;
                  break;
                case 'Critical Processes':
                  location.critical_processes = value;
                  break;
                case 'Active Users':
                  location.active_users = parseInt(value) || 0;
                  break;
                case 'Number of Servers':
                  location.num_servers = parseInt(value) || 0;
                  break;
                case 'Number of Devices':
                  location.num_devices = parseInt(value) || 0;
                  break;
                case 'Hosted Applications':
                  location.hosted_applications = value;
                  break;
              }
            });
            
            return location;
          });
        
        resolve(locations);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}