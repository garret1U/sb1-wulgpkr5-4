import React from 'react';
import { Home, Building2, Network, MapPin, Filter, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useFilterPersistence } from '../../contexts/FilterPersistenceContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'Circuits', href: '/circuits', icon: Network },
  { name: 'Proposals', href: '/proposals', icon: FileText }
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { isPersistent, togglePersistence } = useFilterPersistence();

  return (
    <aside
      className={`
        flex flex-col z-50 min-h-0
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ISP Circuit Setup</h1>
      </div>
      
      <nav className="flex-1 mt-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 text-sm rounded-md
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={togglePersistence}
          className="w-full flex items-center justify-between px-4 py-2 text-sm rounded-md
                   text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Persist Filters</span>
          </div>
          <div className={`w-8 h-4 rounded-full transition-colors ${
            isPersistent ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
              isPersistent ? 'translate-x-4' : 'translate-x-1'
            } mt-0.5`} />
          </div>
        </button>
      </div>
    </aside>
  );
}