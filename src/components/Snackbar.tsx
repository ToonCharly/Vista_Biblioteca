import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Snackbar = ({ message, type, onClose }: SnackbarProps) => {
  useEffect(() => {
    // Auto-cerrar después de 3 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
        <span className="text-xl font-bold">{icon}</span>
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 font-bold text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
