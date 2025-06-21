
import React from 'react';
import { AlertMessage, AlertType } from '../types';

interface AlertProps extends AlertMessage {
  onDismiss: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({ id, type, message, onDismiss }) => {
  const baseClasses = 'p-4 mb-4 text-sm rounded-lg shadow-md flex justify-between items-start';
  let typeClasses = '';

  switch (type) {
    case AlertType.Success:
      typeClasses = 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800';
      break;
    case AlertType.Error:
      typeClasses = 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800';
      break;
    case AlertType.Warning:
      typeClasses = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800';
      break;
    case AlertType.Info:
    default:
      typeClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-800';
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <div>
        <span className="font-medium">
          {type === AlertType.Success && 'Successo! '}
          {type === AlertType.Error && 'Errore! '}
          {type === AlertType.Warning && 'Attenzione! '}
          {type === AlertType.Info && 'Info: '}
        </span>
        {message}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="ml-4 -mt-1 -mr-1 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
        aria-label="Chiudi"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Alert;
