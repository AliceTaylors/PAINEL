import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faWallet,
  faShoppingCart,
  faCode,
  faSignOutAlt,
  faUserCircle,
  faChartLine,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function Header({ user }) {
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleWalletClick = () => {
    router.push('/dashboard/wallet');
  };

  return (
    <header style={{
      background: '#111',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => router.push('/dashboard')}
          style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: '#00ff00',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FontAwesomeIcon icon={faRocket} />
          SECCX<span style={{ color: '#fff' }}>.PRO</span>
        </div>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              background: 'rgba(0,255,0,0.1)',
              padding: '8px 15px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faUserCircle} style={{ color: '#00ff00' }} />
              <span style={{ color: '#fff' }}>{user.login}</span>
            </div>
            <div 
              onClick={handleWalletClick}
              style={{
                background: 'rgba(0,255,0,0.1)',
                padding: '8px 15px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faChartLine} style={{ color: '#00ff00' }} />
              <span style={{ color: '#fff' }}>${user.balance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <nav style={{
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {[
          { path: '/dashboard', icon: faHome, label: t('home') },
          { path: '/dashboard/wallet', icon: faWallet, label: t('wallet') },
          { path: '/dashboard/shop', icon: faShoppingCart, label: t('shop') },
          { path: '/dashboard/api', icon: faCode, label: 'API' }
        ].map(({ path, icon, label }) => (
          <button
            key={path}
            onClick={() => router.push(path)}
            style={{
              padding: '10px 20px',
              background: router.pathname === path ? 'rgba(0,255,0,0.1)' : '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ color: '#00ff00' }} />
            {label}
          </button>
        ))}

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,0,0,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto',
            fontSize: '14px'
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} style={{ color: '#ff4444' }} />
          {t('logout')}
        </button>
      </nav>
    </header>
  );
}
