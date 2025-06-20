import React from 'react';

/**
 * Tabla responsiva con sticky headers optimizada para tablets
 * - Headers pegajosos al hacer scroll
 * - Contenedor con altura máxima y scroll interno
 * - Diseño adaptativo para diferentes orientaciones
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  darkMode = false,
  maxHeight = '70vh',
  stickyHeader = true,
  className = '',
  onRowClick,
  selectedRowId,
  emptyMessage = 'No hay datos disponibles'
}) => {
  return (
    <div 
      className={`
        w-full overflow-hidden rounded-lg border
        ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        ${className}
      `}
    >
      <div 
        className={`
          overflow-y-auto overflow-x-auto
          ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}
        `}
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
            <tr className={`
              ${darkMode ? 'bg-gray-800' : 'bg-white'}
              shadow-sm
            `}>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`
                    px-4 py-3 text-left font-medium text-sm
                    ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}
                    border-b-2
                    ${stickyHeader ? 'backdrop-blur-sm bg-opacity-95' : ''}
                    ${column.className || ''}
                  `}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                    ${selectedRowId === row.id ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    transition-colors duration-150
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${row.id}-${column.key}` || `${rowIndex}-${colIndex}`}
                      className={`
                        px-4 py-3 text-sm
                        ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}
                        border-b
                        ${column.cellClassName || ''}
                      `}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length}
                  className={`
                    px-4 py-8 text-center text-sm
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                  `}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;