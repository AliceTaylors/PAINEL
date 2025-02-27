import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faHome,
  faShop,
  faCode,
  faRightFromBracket,
  faBarcode,
  faRocket,
  faSearch
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
            className={`nav-item ${router.pathname === '/dashboard/api' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/api')}
          >
            <FontAwesomeIcon icon={faCode} />
            <span>API Docs</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/dashboard/stresser' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/stresser')}
          >
            <FontAwesomeIcon icon={faRocket} />
            <span>Stresser</span>
          </button>

          <button 
            className={`nav-item ${router.pathname === '/dashboard/consulta' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/consulta')}
          >
            <FontAwesomeIcon icon={faSearch} />
            <span>Consulta</span>
          </button>
        </nav>

        <div className="user-controls">
          <div className="balance">
            <span>${user?.balance?.toFixed(2)}</span>
          </div>
          <button className="nav-item" onClick={() => {
            window.localStorage.removeItem('token');
            router.push('/');
          }}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .header {
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,255,68,0.1);
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 1.5rem;
          color: #00ff44;
        }

        .gradient-text {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .nav-menu {
          display: flex;
          gap: 15px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border-radius: 12px;
          background: transparent;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .nav-item:hover {
          background: rgba(0,255,68,0.1);
          transform: translateY(-2px);
        }

        .nav-item.active {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          font-weight: 600;
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .balance {
          background: rgba(0,255,68,0.1);
          padding: 8px 15px;
          border-radius: 12px;
          color: #00ff44;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
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
