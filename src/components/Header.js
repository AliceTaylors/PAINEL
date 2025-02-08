import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faHome,
  faShop,
  faGear,
  faRightFromBracket,
  faUser,
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

          {user?.admin && (
            <button 
              className={`nav-item ${router.pathname === '/administration' ? 'active' : ''}`}
              onClick={() => router.push('/administration')}
            >
              <FontAwesomeIcon icon={faGear} />
              <span>Admin</span>
            </button>
          )}
        </nav>

        <div className="user-controls">
          <div className="balance">
            <FontAwesomeIcon icon={faWallet} />
            <span>${user?.balance?.toFixed(2)}</span>
          </div>

          <div className="user-menu">
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
      </div>

      <style jsx>{`
        .header {
          background: rgba(0,255,68,0.03);
          border-bottom: 1px solid rgba(0,255,68,0.1);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .gradient-text {
          font-size: clamp(1.2rem, 2vw, 1.5rem);
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .nav-menu {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .nav-item:hover {
          background: rgba(0,255,68,0.1);
        }

        .nav-item.active {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          font-weight: 600;
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
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            padding: 10px;
          }

          .nav-menu {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .user-controls {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .nav-item span {
            display: none;
          }

          .nav-item {
            padding: 8px;
          }

          .balance {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
