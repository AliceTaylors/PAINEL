import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faHome,
  faShop,
  faGear,
  faRightFromBracket,
  faCode,
  faBarcode
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

export default function Header({ user }) {
  const router = useRouter();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => router.push('/dashboard')}>
          <FontAwesomeIcon icon={faBarcode} />
          <span className="gradient-text">SECCX.PRO</span>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${router.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard')}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/dashboard/wallet' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/wallet')}
          >
            <FontAwesomeIcon icon={faWallet} />
            <span>Wallet</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/dashboard/shop' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/shop')}
          >
            <FontAwesomeIcon icon={faShop} />
            <span>Shop</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/api' ? 'active' : ''}`}
            onClick={() => router.push('/api')}
          >
            <FontAwesomeIcon icon={faCode} />
            <span>API Docs</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/dashboard/settings' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/settings')}
          >
            <FontAwesomeIcon icon={faGear} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="user-controls">
          <div className="balance">
            <FontAwesomeIcon icon={faWallet} />
            <span>${user?.balance?.toFixed(2)}</span>
          </div>
          
          <button 
            className="nav-item logout"
            onClick={() => {
              window.localStorage.removeItem('token');
              router.push('/');
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .header {
          background: rgba(0,0,0,0.95);
          border-bottom: 1px solid rgba(0,255,68,0.1);
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 1.5rem;
          color: #00ff44;
          transition: all 0.3s ease;
        }

        .logo:hover {
          transform: translateY(-2px);
        }

        .gradient-text {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .nav-menu {
          display: flex;
          gap: 10px;
        }

        .nav-item {
          background: transparent;
          border: none;
          color: #888;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          color: #00ff44;
          background: rgba(0,255,68,0.1);
          transform: translateY(-2px);
        }

        .nav-item.active {
          color: #00ff44;
          background: rgba(0,255,68,0.1);
        }

        .nav-item.logout {
          color: #ff4444;
        }

        .nav-item.logout:hover {
          background: rgba(255,68,68,0.1);
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .balance {
          background: rgba(0,255,68,0.1);
          padding: 8px 15px;
          border-radius: 8px;
          color: #00ff44;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .balance:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,255,68,0.1);
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            padding: 10px;
            gap: 15px;
          }

          .nav-menu {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
          }

          .user-controls {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
          }

          .nav-item {
            padding: 8px 12px;
          }

          .nav-item span {
            display: none;
          }

          .balance {
            width: auto;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </header>
  );
}
