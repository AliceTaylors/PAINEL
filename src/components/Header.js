import Link from 'next/link';
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
import useTranslation from 'next-translate/useTranslation';

export default function Header({ user }) {
  const { t } = useTranslation('common');

  return (
    <header style={{
      background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,17,17,0.95) 100%)',
      backdropFilter: 'blur(10px)',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/dashboard">
          <a style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: '#00ff00',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FontAwesomeIcon icon={faRocket} />
            SECCX.PRO
          </a>
        </Link>

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
          <div style={{
            background: 'rgba(0,255,0,0.1)',
            padding: '8px 15px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#00ff00' }} />
            <span style={{ color: '#fff' }}>${user.balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <nav style={{
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {[
          { href: '/dashboard', icon: faHome, label: t('home') },
          { href: '/dashboard/wallet', icon: faWallet, label: t('wallet') },
          { href: '/dashboard/shop', icon: faShoppingCart, label: t('shop') },
          { href: '/dashboard/api', icon: faCode, label: 'API' }
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href}>
            <a style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              ':hover': {
                background: 'rgba(0,255,0,0.1)',
                transform: 'translateY(-2px)'
              }
            }}>
              <FontAwesomeIcon icon={icon} style={{ color: '#00ff00' }} />
              {label}
            </a>
          </Link>
        ))}
        <button
          onClick={() => {
            window.localStorage.removeItem('token');
            window.location.href = '/';
          }}
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
            marginLeft: 'auto'
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} style={{ color: '#ff4444' }} />
          {t('logout')}
        </button>
      </nav>
    </header>
  );
}
