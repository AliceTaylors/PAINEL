import { faMessage, faCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Router } from 'next/router';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <span className="brand-text">
          <FontAwesomeIcon icon={faCode} className="icon" />
          SECCX.PRO
        </span>
      </div>
      
      <style jsx>{`
        footer {
          text-align: center;
          padding: 25px;
          background: linear-gradient(180deg, transparent, rgba(107, 33, 168, 0.1));
          margin-top: 40px;
        }

        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .brand-text {
          font-size: 16px;
          font-weight: bold;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 2px;
          padding: 10px 20px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.1);
          transition: all 0.3s ease;
        }

        .brand-text:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 33, 168, 0.2);
        }

        .icon {
          margin-right: 10px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .brand-text {
            font-size: 14px;
            padding: 8px 16px;
          }
        }
      `}</style>
    </footer>
  );
}
