import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBarcode,
  faCheck,
  faEarth,
  faLock,
  faMessage,
  faPerson,
  faUser,
  faCreditCard,
  faShieldHalved,
  faRocket,
  faGem,
  faChartLine,
  faServer,
  faBolt,
  faUserShield,
  faDatabase,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import { NextSeo } from 'next-seo';
import { useEffect } from 'react';
import versionData from '../version.json';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Link from 'next/link';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState(null);
  const alerts = withReactContent(Swal);

  async function getUser() {
    const res = await axios.get('/api/sessions', {
      headers: { token: window.localStorage.getItem('token') },
    });

    if (res.data.error) {
      setUser(null);
      return;
    }

    setUser(res.data.user || null);
  }

  function checkVersion() {
    if (!window.localStorage.getItem(versionData.versionCode)) {
      alerts.fire({
        icon: 'info',
        title: 'New version: ' + versionData.versionCode + '!',
        html: versionData.updates,
      });
      window.localStorage.setItem(versionData.versionCode, 'true');
    }
  }
  function checkSSL() {
    if (
      window.location.protocol == 'http:' &&
      window.location.host != 'localhost:3000' &&
      window.location.host != '127.0.0.1:3000' &&
      window.location.host.indexOf('192.168.0.') < 0
    ) {
      router.push(
        window.location.href
          .replace('http:', 'https:')
          .replace('herokupp.com', '.tech')
          .replace('vercel.app', '.tech')
      );
    }
  }

  useEffect(() => {
    async function getStatus() {
      const res = await axios.get('/api/status');
      setStatus(res.data);
    }
    getStatus();
    checkSSL();
    checkVersion();
    getUser();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);
  return (
    <div className="landing-page">
      <Head>
        <title>SECCX.PRO | Premium Card Checker</title>
        <meta name="description" content="Professional card checking service with advanced features and real-time validation" />
      </Head>

      <div className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">SECCX.PRO</span>
            <span className="version-badge">v2.0</span>
          </h1>
          <p className="hero-subtitle">Advanced Card Checking Platform</p>
          
          <div className="hero-buttons">
            <Link href="/login">
              <a className="hero-button login">
                <FontAwesomeIcon icon={faRocket} />
                Launch Platform
              </a>
            </Link>
            <Link href="/signup">
              <a className="hero-button register">
                <FontAwesomeIcon icon={faGem} />
                Create Account
              </a>
            </Link>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <FontAwesomeIcon icon={faChartLine} />
            <div>
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faBolt} />
            <div>
              <h3>3s</h3>
              <p>Per Check</p>
            </div>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faServer} />
            <div>
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Premium Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FontAwesomeIcon icon={faCreditCard} className="feature-icon" />
            <h3>Dual Checkers</h3>
            <p>Choose between Standard and Premium gateways</p>
            <ul>
              <li>Adyen Gateway: $0.50/live</li>
              <li>Premium Gateway: $1.00/live</li>
              <li>Real-time validation</li>
              <li>Detailed card info</li>
            </ul>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faShieldHalved} className="feature-icon" />
            <h3>Advanced Security</h3>
            <p>Enterprise-grade protection for your operations</p>
            <ul>
              <li>Encrypted connections</li>
              <li>Secure authentication</li>
              <li>Activity monitoring</li>
              <li>IP protection</li>
            </ul>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faDatabase} className="feature-icon" />
            <h3>Premium Information</h3>
            <p>Comprehensive card details and analysis</p>
            <ul>
              <li>Bank identification</li>
              <li>Card level detection</li>
              <li>BIN validation</li>
              <li>Country tracking</li>
            </ul>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faCode} className="feature-icon" />
            <h3>API Integration</h3>
            <p>Seamless integration with your systems</p>
            <ul>
              <li>RESTful API</li>
              <li>Detailed documentation</li>
              <li>Sample code</li>
              <li>Multiple languages</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <h2>Transparent Pricing</h2>
        <div className="pricing-cards">
          <div className="pricing-card standard">
            <div className="pricing-header">
              <h3>Standard</h3>
              <div className="price">$0.50<span>/live</span></div>
            </div>
            <ul>
              <li>✓ Adyen Gateway</li>
              <li>✓ Basic validation</li>
              <li>✓ Fast checking</li>
              <li>✓ No cost for dies</li>
              <li>✓ API access</li>
            </ul>
            <Link href="/signup">
              <a className="pricing-button">Get Started</a>
            </Link>
          </div>

          <div className="pricing-card premium">
            <div className="premium-badge">PREMIUM</div>
            <div className="pricing-header">
              <h3>Premium</h3>
              <div className="price">$1.00<span>/live</span></div>
            </div>
            <ul>
              <li>✓ Premium Gateway</li>
              <li>✓ Enhanced validation</li>
              <li>✓ BIN information</li>
              <li>✓ Bank details</li>
              <li>✓ Card level & type</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/signup">
              <a className="pricing-button premium">Get Premium</a>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
          color: #fff;
        }

        .hero-section {
          padding: 100px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at center, rgba(0,255,68,0.1) 0%, transparent 70%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .gradient-text {
          font-size: 4rem;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .version-badge {
          font-size: 1rem;
          background: rgba(0,255,68,0.1);
          padding: 5px 10px;
          border-radius: 20px;
          margin-left: 10px;
          color: #00ff44;
          vertical-align: super;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #666;
          margin: 20px 0 40px;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .hero-button {
          padding: 15px 30px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .hero-button.login {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
        }

        .hero-button.register {
          background: transparent;
          border: 2px solid #00ff44;
          color: #00ff44;
        }

        .hero-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,255,68,0.2);
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 50px;
          margin-top: 80px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #00ff44;
        }

        .stat-item h3 {
          font-size: 1.5rem;
          margin: 0;
        }

        .stat-item p {
          color: #666;
          margin: 0;
        }

        .features-section {
          padding: 100px 20px;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(0,255,68,0.05);
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,255,68,0.1);
          border-color: #00ff44;
        }

        .feature-icon {
          font-size: 2rem;
          color: #00ff44;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          color: #fff;
          margin-bottom: 15px;
        }

        .feature-card p {
          color: #666;
          margin-bottom: 20px;
        }

        .feature-card ul {
          color: #888;
          list-style: none;
          padding: 0;
        }

        .feature-card li {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feature-card li:before {
          content: "→";
          color: #00ff44;
        }

        .pricing-section {
          padding: 100px 20px;
          background: linear-gradient(180deg, transparent 0%, rgba(0,255,68,0.05) 100%);
        }

        .pricing-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pricing-cards {
          display: flex;
          justify-content: center;
          gap: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .pricing-card {
          background: rgba(0,255,68,0.05);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          min-width: 300px;
          position: relative;
        }

        .pricing-card.premium {
          background: linear-gradient(135deg, rgba(0,255,68,0.1) 0%, rgba(0,204,68,0.1) 100%);
          border: 2px solid #00ff44;
        }

        .premium-badge {
          position: absolute;
          top: -15px;
          right: -15px;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          color: #000;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .price {
          font-size: 3rem;
          font-weight: bold;
          color: #00ff44;
        }

        .price span {
          font-size: 1rem;
          color: #666;
        }

        .pricing-card ul {
          list-style: none;
          padding: 0;
          margin-bottom: 30px;
        }

        .pricing-card li {
          margin: 15px 0;
          color: #888;
        }

        .pricing-button {
          display: block;
          text-align: center;
          padding: 15px;
          border-radius: 12px;
          background: #111;
          color: #00ff44;
          border: 1px solid #00ff44;
          transition: all 0.3s ease;
        }

        .pricing-button.premium {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          border: none;
        }

        .pricing-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,255,68,0.2);
        }

        @media (max-width: 768px) {
          .gradient-text {
            font-size: 3rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .stats-bar {
            flex-direction: column;
            gap: 30px;
          }

          .pricing-cards {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
