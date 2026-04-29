import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'error' ? 'bg-red-600' : 'bg-green-700';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white text-sm max-w-sm ${bg}`}>
      {message}
      <button onClick={onClose} className="ml-3 font-bold">×</button>
    </div>
  );
}
