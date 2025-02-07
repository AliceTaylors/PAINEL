import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Footer() {
  return (
    <div style={{ 
      marginTop: '70px', 
      marginBottom: '20px',
      opacity: 0.4
    }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <a
          href="https://t.me/CHECKERCC"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            padding: '8px', 
            fontSize: '14px',
            color: '#fff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faMessage} /> Join Telegram Chat
        </a>
      </div>
      <div style={{ fontSize: '15px', textAlign: 'center' }}>
        <span>SECCX.PRO @ 2022~{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
