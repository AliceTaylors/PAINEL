import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Implementar WebSocket connection aqui
    const ws = new WebSocket('wss://seccx.pro/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addNotification(data);
    };

    return () => ws.close();
  }, []);

  const addNotification = (data) => {
    setNotifications(prev => [...prev, data].slice(-5));
  };

  return (
    <div className="notifications-container">
      {notifications.map((notif, index) => (
        <div 
          key={index} 
          className={`notification-item ${notif.type}`}
        >
          <FontAwesomeIcon 
            icon={notif.type === 'success' ? faCheck : faTimes} 
            className="notif-icon"
          />
          <div className="notif-content">
            <div className="notif-title">{notif.title}</div>
            <div className="notif-message">{notif.message}</div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 300px;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(17, 17, 17, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          animation: slideIn 0.3s ease;
        }

        .notification-item.success {
          border-left: 4px solid #00ff44;
        }

        .notification-item.error {
          border-left: 4px solid #ff3366;
        }

        .notif-icon {
          font-size: 20px;
        }

        .success .notif-icon {
          color: #00ff44;
        }

        .error .notif-icon {
          color: #ff3366;
        }

        .notif-content {
          flex: 1;
        }

        .notif-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .notif-message {
          font-size: 14px;
          color: #888;
        }

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
      `}</style>
    </div>
  );
} 
