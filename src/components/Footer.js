import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faTelegram,
  faGithub
} from '@fortawesome/free-brands-svg-icons';
import {
  faShieldHalved,
  faGem,
  faCode
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>Security</span>
            </h3>
            <ul>
              <li>256-bit SSL Encryption</li>
              <li>Secure Transactions</li>
              <li>Anti-DDoS Protection</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>
              <FontAwesomeIcon icon={faGem} />
              <span>Features</span>
            </h3>
            <ul>
              <li>Premium Checkers</li>
              <li>Real-time Validation</li>
              <li>24/7 Availability</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>
              <FontAwesomeIcon icon={faCode} />
              <span>API</span>
            </h3>
            <ul>
              <li>REST API Access</li>
              <li>Developer Support</li>
              <li>Documentation</li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="social-link">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="social-link">
            <FontAwesomeIcon icon={faTelegram} />
          </a>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="social-link">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>

        <div className="footer-bottom">
          <p>© 2024 SECCX.PRO - All rights reserved</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: rgba(0,255,68,0.03);
          border-top: 1px solid rgba(0,255,68,0.1);
          padding: 40px 20px 20px;
          margin-top: 40px;
          backdrop-filter: blur(10px);
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h3 {
          color: #00ff44;
          font-size: 1.2rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section li {
          color: #888;
          margin: 10px 0;
          transition: all 0.3s ease;
          cursor: default;
        }

        .footer-section li:hover {
          color: #00ff44;
          transform: translateX(5px);
        }

        .footer-social {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0,255,68,0.1);
          color: #00ff44;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,255,68,0.2);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 30px 15px 15px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }

          .footer-section h3 {
            justify-content: center;
          }

          .footer-section li:hover {
            transform: none;
          }
        }

        @media (max-width: 480px) {
          .social-link {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}
