import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Router } from 'next/router';
import Link from 'next/link';
export default function Footer() {
  return (
    <div style={{ marginTop: '70px', marginBottom: '20px', opacity: 0.4 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Link href="https://t.me/CHECKERCC">
          <button style={{ padding: '8px', fontSize: '14px' }}>
            <FontAwesomeIcon icon={faMessage} /> Join Telegram Chat
          </button>
        </Link>
      </div>
      <div style={{ fontSize: '15px', textAlign: 'center' }}>
        <span>CHECKERCC.SITE @ 2022~{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
