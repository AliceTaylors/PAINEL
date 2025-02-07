import { faMessage, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export default function Footer() {
  return (
    <div style={{ 
      marginTop: '70px', 
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #111 0%, #000 100%)',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <Link href="https://t.me/CHECKERCC">
          <button style={{ 
            padding: '12px 24px',
            fontSize: '14px',
            background: 'rgba(0,255,0,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FontAwesomeIcon icon={faMessage} style={{ color: '#00ff00' }} />
            Join Telegram Chat
          </button>
        </Link>
      </div>
      <div style={{ 
        fontSize: '15px', 
        textAlign: 'center',
        color: '#666'
      }}>
        <FontAwesomeIcon icon={faRocket} style={{ color: '#00ff00', marginRight: '8px' }} />
        SECCX.PRO © {new Date().getFullYear()}
      </div>
    </div>
  );
}
