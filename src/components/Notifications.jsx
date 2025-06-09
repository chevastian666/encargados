import { Check, X, AlertTriangle, AlertCircle } from 'lucide-react';

export const NotificationContainer = ({ notifications }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map((n) => (
      <Toast key={n.id} {...n} />
    ))}
  </div>
);

export const Toast = ({ type, message }) => {
  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${colors[type]} animate-slide-in`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
};
