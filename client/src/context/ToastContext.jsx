import { createContext, useContext, useState, useCallback } from 'react';
import {
  MdCheckCircle,
  MdWarning,
  MdErrorOutline,
  MdInfo,
  MdClose,
} from 'react-icons/md';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          let icon = <MdInfo />;
          if (toast.type === 'success') icon = <MdCheckCircle />;
          if (toast.type === 'warning') icon = <MdWarning />;
          if (toast.type === 'error') icon = <MdErrorOutline />;

          return (
            <div key={toast.id} className={`toast-item toast-${toast.type}`}>
              <div className="toast-icon">{icon}</div>
              <div className="toast-message">{toast.message}</div>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <MdClose />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
