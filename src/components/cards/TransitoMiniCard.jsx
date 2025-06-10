import React from 'react';
import { ESTADOS } from '../../constants/constants';

const TransitoMiniCard = ({ transito, onClick, darkMode }) => {
  return (
    <div 
      className={`p-3 rounded-lg shadow border cursor-pointer transition-all
        bg-white dark:bg-gray-800
        hover:border-blue-400 dark:hover:border-blue-500`}
      onClick={onClick}
    >
      <div className="text-xs font-bold mb-1">{transito.matricula}</div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400">{transito.secundaria}</div>
      <div className="text-[11px] mt-1">⏱️ {transito.salida}</div>
      <div className="text-[11px]">📦 {transito.tipo === 'contenedor' ? transito.codigo : 'Lona'}</div>
      <div className="text-[11px]">📍 {transito.deposito}</div>
      <div className={`text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full text-white ${ESTADOS[transito.estado].color}`}>
        {ESTADOS[transito.estado].label}
      </div>
    </div>
  );
};

export default TransitoMiniCard;
