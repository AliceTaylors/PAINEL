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
  faCode,
  faRobot,
  faGaugeHigh,
  faWallet,
  faCartShopping,
  faDatabase,
  faGears,
  faChartLine
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header className="hero">
        <div className="hero-content">
          <div className="logo-container">
            <FontAwesomeIcon icon={faBarcode} className="logo-icon" />
            <h1>
              <span className="gradient-text">SECCX.PRO</span>
            </h1>
          </div>
          <p className="subtitle">Premium Card Checking Service</p>
          
          <div className="auth-buttons">
            <Link href="/login">
              <a className="auth-button login-btn">
                <FontAwesomeIcon icon={faUser} />
                <span>Login</span>
              </a>
            </Link>
            <Link href="/signup">
              <a className="auth-button register-btn">
                <FontAwesomeIcon icon={faPerson} />
                <span>Create Account</span>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="features">
          <h2>Premium Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FontAwesomeIcon icon={faCreditCard} className="feature-icon" />
              <h3>Dual Checkers</h3>
              <p>Choose between Standard (Basic) and Premium checkers for different needs</p>
              <ul>
                <li>Basic: $0.50 per live</li>
                <li>Premium: $1.00 per live, includes BIN data</li>
              </ul>
            </div>

            <div className="feature-card">
              <FontAwesomeIcon icon={faGaugeHigh} className="feature-icon" />
              <h3>High Performance</h3>
              <p>Lightning-fast checking speed with real-time results</p>
              <ul>
                <li>1 request per 3 seconds</li>
                <li>Instant validation</li>
                <li>Real-time balance updates</li>
              </ul>
            </div>

            <div className="feature-card">
              <FontAwesomeIcon icon={faCode} className="feature-icon" />
              <h3>API Integration</h3>
              <p>Easy integration with your existing systems</p>
              <ul>
                <li>RESTful API</li>
                <li>Multiple programming languages</li>
                <li>Detailed documentation</li>
              </ul>
            </div>

            <div className="feature-card">
              <FontAwesomeIcon icon={faDatabase} className="feature-icon" />
              <h3>Premium Information</h3>
              <p>Detailed card information with Premium checker</p>
              <ul>
                <li>Bank identification</li>
                <li>Card type & level</li>
                <li>Country information</li>
              </ul>
            </div>

            <div className="feature-card">
              <FontAwesomeIcon icon={faShieldHalved} className="feature-icon" />
              <h3>Security</h3>
              <p>Advanced security measures to protect your account</p>
              <ul>
                <li>Encrypted connections</li>
                <li>Secure authentication</li>
                <li>Activity monitoring</li>
              </ul>
            </div>

            <div className="feature-card">
              <FontAwesomeIcon icon={faWallet} className="feature-icon" />
              <h3>Wallet System</h3>
              <p>Easy-to-use balance management</p>
              <ul>
                <li>Multiple payment methods</li>
                <li>Instant deposits</li>
                <li>Transaction history</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stats-container">
            <div className="stat-item">
              <FontAwesomeIcon icon={faGaugeHigh} className="stat-icon" />
              <div className="stat-info">
                <h3>Fast</h3>
                <p>1 check/3s</p>
              </div>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faShieldHalved} className="stat-icon" />
              <div className="stat-info">
                <h3>Secure</h3>
                <p>Encrypted</p>
              </div>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faDatabase} className="stat-icon" />
              <div className="stat-info">
                <h3>Reliable</h3>
                <p>99.9% Uptime</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing">
          <h2>Transparent Pricing</h2>
          <div className="pricing-cards">
            <div className="pricing-card standard">
              <h3>Standard Checker</h3>
              <div className="price">$0.50<span>/live</span></div>
              <ul>
                <li>✓ Basic validation</li>
                <li>✓ Fast checking</li>
                <li>✓ API access</li>
                <li>✓ No cost for dies</li>
              </ul>
            </div>

            <div className="pricing-card premium">
              <div className="premium-badge">PREMIUM</div>
              <h3>Premium Checker</h3>
              <div className="price">$1.00<span>/live</span></div>
              <ul>
                <li>✓ Enhanced validation</li>
                <li>✓ BIN information</li>
                <li>✓ Bank details</li>
                <li>✓ Card level & type</li>
                <li>✓ Country data</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .landing-page {
          background: #0a0a0a;
          color: #fff;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 100px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(107, 33, 168, 0.1) 0%, transparent 70%);
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 2.5rem;
          color: #6b21a8;
        }

        .gradient-text {
          font-size: 3.5rem;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #888;
          margin: 20px 0;
        }

        .auth-buttons {
          display: flex;
          gap: 20px;
          margin-top: 30px;
          justify-content: center;
        }

        .auth-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .auth-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          transform: translateX(-100%);
          transition: all 0.3s ease;
        }

        .auth-button:hover::before {
          transform: translateX(0);
        }

        .login-btn {
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          color: white;
          border: none;
        }

        .login-btn:hover {
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.4);
          transform: translateY(-2px);
        }

        .register-btn {
          background: transparent;
          color: white;
          border: 2px solid #6b21a8;
        }

        .register-btn:hover {
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.4);
          transform: translateY(-2px);
        }

        .features {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .features h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          padding: 20px;
        }

        .feature-card {
          background: #111;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #222;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: #6b21a8;
        }

        .feature-icon {
          font-size: 2rem;
          color: #6b21a8;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          color: #fff;
          margin-bottom: 15px;
        }

        .feature-card p {
          color: #888;
          margin-bottom: 15px;
        }

        .feature-card ul {
          color: #666;
          list-style: none;
          padding: 0;
        }

        .feature-card li {
          margin: 8px 0;
        }

        .stats {
          background: #111;
          padding: 60px 20px;
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 30px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #1a1a1a;
          border-radius: 12px;
          border: 1px solid #222;
          min-width: 200px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          border-color: #6b21a8;
        }

        .stat-icon {
          font-size: 2rem;
          color: #6b21a8;
        }

        .stat-info h3 {
          color: #fff;
          margin: 0;
        }

        .stat-info p {
          color: #888;
          margin: 5px 0 0;
        }

        .pricing {
          padding: 80px 20px;
          background: #0c0c0c;
        }

        .pricing h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pricing-cards {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-card {
          background: #111;
          padding: 40px;
          border-radius: 12px;
          border: 1px solid #222;
          min-width: 300px;
          position: relative;
        }

        .premium-badge {
          position: absolute;
          top: -15px;
          right: -15px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .pricing-card h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }

        .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #6b21a8;
          margin-bottom: 30px;
        }

        .price span {
          font-size: 1rem;
          color: #666;
        }

        .pricing-card ul {
          list-style: none;
          padding: 0;
        }

        .pricing-card li {
          margin: 15px 0;
          color: #888;
        }

        @media (max-width: 768px) {
          .gradient-text {
            font-size: 2.5rem;
          }

          .hero {
            padding: 60px 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            padding: 10px;
          }

          .pricing-cards {
            flex-direction: column;
            align-items: center;
            padding: 10px;
          }

          .stat-item {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .gradient-text {
            font-size: 2rem;
          }

          .auth-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 280px;
            margin: 30px auto;
          }

          .auth-button {
            width: 100%;
          }

          .feature-card {
            margin: 10px;
          }
        }

        /* Animações */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .feature-card {
          animation: float 6s ease-in-out infinite;
        }

        .feature-card:nth-child(2) {
          animation-delay: 1s;
        }

        .feature-card:nth-child(3) {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
