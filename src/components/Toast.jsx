import { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info' }) => {
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [message]);

  if (!show) return null;

  const bgColor = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info'
  }[type] || 'bg-info';

  const icon = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }[type] || 'ℹ';

  return (
    <div 
      className={`position-fixed bottom-0 end-0 m-3 p-3 text-white rounded shadow-lg ${bgColor}`}
      style={{ 
        zIndex: 9999, 
        minWidth: '250px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="d-flex align-items-center">
        <span className="me-2 fs-5">{icon}</span>
        <span>{message}</span>
        <button 
          className="btn-close btn-close-white ms-auto" 
          onClick={() => setShow(false)}
          aria-label="Close"
        />
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;