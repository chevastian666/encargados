import React from 'react';
import { 
  Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon
} from 'lucide-react';
import { useDarkMode } from '../../hooks';
import { ConnectionStatus } from '../common';

const DashboardSimple = ({ onModuleClick }) => {
  const [darkMode, , toggleDarkMode] = useDarkMode();

  const modules = [
    { 
      id: 'transitos', 
      title: 'Tránsitos Pendientes', 
      icon: Package, 
      color: 'bg-blue-600',
      count: 12,
      description: 'Vehículos esperando'
    },
    { 
      id: 'mapa', 
      title: 'Mapa en Vivo', 
      icon: MapPin, 
      color: 'bg-green-600',
      count: 8,
      description: 'Camiones en ruta'
    },
    { 
      id: 'stock', 
      title: 'Gestión de Stock', 
      icon: Database, 
      color: 'bg-purple-600',
      description: 'Control de inventario'
    },
    { 
      id: 'alertas', 
      title: 'Alertas Operativas', 
      icon: AlertTriangle, 
      color: 'bg-orange-600',
      count: 3,
      description: 'Requieren atención'
    },
    { 
      id: 'camiones', 
      title: 'Base de Datos', 
      icon: Truck, 
      color: 'bg-teal-600',
      count: 1247,
      description: 'Vehículos registrados'
    },
    { 
      id: 'desprecintar', 
      title: 'Por Desprecintar', 
      icon: Package, 
      color: 'bg-red-600',
      count: 7,
      description: 'Camiones internacionales'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg px-4 sm:px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sistema de Precintado Aduanero
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Puerto de Montevideo
            </p>
          </div>
          
          <ConnectionStatus darkMode={darkMode} />
          
          <button
            onClick={toggleDarkMode}
            className={`ml-4 p-3 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            } transition-all duration-200`}
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleClick(module.id)}
                  className={`
                    relative overflow-hidden
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    border
                    p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                    text-left w-full group
                  `}
                >
                  <div className={`${module.color} p-3 rounded-xl inline-block mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {module.title}
                  </h3>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {module.description}
                  </p>

                  {module.count !== undefined && (
                    <p className={`text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {module.count}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSimple;