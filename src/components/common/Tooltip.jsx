import React, { useState, useRef, useEffect } from 'react';

/**
 * Componente Tooltip
 * @param {Object} props - Propiedades del componente
 * @param {string} props.text - Texto del tooltip
 * @param {React.ReactNode} props.children - Elemento que activa el tooltip
 * @param {string} props.position - Posición del tooltip (top, bottom, left, right)
 * @param {number} props.delay - Delay antes de mostrar el tooltip (ms)
 * @param {boolean} props.disabled - Si el tooltip está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 */
const Tooltip = ({ 
  text, 
  children, 
  position = 'top',
  delay = 200,
  disabled = false,
  className = ''
}) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calcular la posición del tooltip
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing;
        break;
      default:
        break;
    }

    // Ajustar si se sale de la pantalla
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = spacing;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - spacing;
    }

    if (top < 0) {
      top = triggerRect.bottom + spacing;
    }
    if (top + tooltipRect.height > viewportHeight) {
      top = triggerRect.top - tooltipRect.height - spacing;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (show) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [show]);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45',
    bottom: 'top-[-4px] left-1/2 transform -translate-x-1/2 rotate-45',
    left: 'right-[-4px] top-1/2 transform -translate-y-1/2 rotate-45',
    right: 'left-[-4px] top-1/2 transform -translate-y-1/2 rotate-45'
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {show && !disabled && text && (
        <div
          ref={tooltipRef}
          className={`
            fixed z-[60] px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 
            rounded-lg shadow-lg whitespace-nowrap pointer-events-none
            transition-opacity duration-200 ${className}
          `}
          style={{ top: coords.top, left: coords.left }}
          role="tooltip"
        >
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;