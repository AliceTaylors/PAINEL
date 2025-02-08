import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faGem,
  faCode,
  faServer,
  faLock,
  faBolt,
  faMessage,
  faGlobe,
  faLink
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
              <li>
                <FontAwesomeIcon icon={faLock} />
                256-bit SSL Encryption
              </li>
              <li>
                <FontAwesomeIcon icon={faServer} />
                DDoS Protection
              </li>
              <li>
                <FontAwesomeIcon icon={faBolt} />
                Real-time Monitoring
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>
              <FontAwesomeIcon icon={faGem} />
              <span>Features</span>
            </h3>
            <ul>
              <li>High Success Rate</li>
              <li>24/7 Support</li>
              <li>Instant Delivery</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>
              <FontAwesomeIcon icon={faCode} />
              <span>API</span>
            </h3>
            <ul>
              <li>REST API</li>
              <li>Documentation</li>
              <li>Integration Guide</li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <a href="#" className="social-link">
            <FontAwesomeIcon icon={faMessage} />
          </a>
          <a href="#" className="social-link">
            <FontAwesomeIcon icon={faGlobe} />
          </a>
          <a href="#" className="social-link">
            <FontAwesomeIcon icon={faLink} />
          </a>
        </div>

        <div className="footer-bottom">
          <p>© 2024 SECCX.PRO - All rights reserved</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.95));
          border-top: 1px solid rgba(0,255,68,0.1);
          padding: 60px 20px 30px;
          backdrop-filter: blur(10px);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
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
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #fff;
          background: rgba(0,255,68,0.1);
          transition: all 0.3s ease;
        }

        .social-link:hover {
          transform: translateY(-5px);
          background: #00ff44;
          color: #000;
          box-shadow: 0 5px 15px rgba(0,255,68,0.3);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .footer-bottom p {
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 40px 15px 20px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }

          .footer-section h3 {
            justify-content: center;
          }

          .footer-section li {
            justify-content: center;
          }

          .footer-section li:hover {
            transform: none;
          }
        }

        @media (max-width: 480px) {
          .social-link {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </footer>
  );
}
