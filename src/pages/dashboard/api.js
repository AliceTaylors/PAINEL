import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faServer,
  faCreditCard,
  faLock,
  faRocket,
  faKey,
  faCopy,
  faRotate,
  faShieldHalved,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ApiDocs() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChecker, setSelectedChecker] = useState('adyen');

  useEffect(() => {
    async function getUser() {
      const res = await axios.get('/api/sessions', {
        headers: { token: window.localStorage.getItem('token') }
      });

      if (res.data.error) {
        router.push('/');
        return;
      }

      setUser(res.data.user);
      setApiKey(res.data.user.apiKey || '');
    }

    getUser();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkerDetails = {
    adyen: {
      name: 'Adyen Checker',
      description: 'High performance checker for Fullz & Gens',
      pricing: {
        live: '$0.20',
        die: 'FREE'
      },
      maxDies: '40 consecutive dies = 24h block',
      example: '407843011649XXXX|07|2028|845',
      responses: {
        live: {
          status: 'live',
          msg: '#LIVE - Card Approved',
          balance: '49.80'
        },
        die: {
          status: 'die',
          msg: '#DIE - Card Declined',
          balance: '50.00'
        },
        error: {
          status: 'error',
          msg: 'Insufficient funds',
          balance: '0.00'
        }
      }
    },
    premium: {
      name: 'Premium Checker',
      description: 'Premium gateway with high approval rate',
      pricing: {
        live: '$1.00',
        die: '$0.10'
      },
      maxDies: '20 consecutive dies = 24h block',
      example: '407843011649XXXX|07|2028|845',
      responses: {
        live: {
          status: 'live',
          msg: '#APPROVED - Premium Check',
          balance: '49.00'
        },
        die: {
          status: 'die',
          msg: '#DECLINED - Premium Check',
          balance: '49.90'
        },
        error: {
          status: 'error',
          msg: 'Account blocked for 24h',
          balance: '49.90'
        }
      }
    }
  };

  return (
    <div className="api-page">
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>

      {user && (
        <>
          <Header user={user} />
          
          <div className="api-container">
            <div className="hero-section">
              <FontAwesomeIcon icon={faCode} className="hero-icon" />
              <h1>API Documentation</h1>
              <p>Integrate our powerful card checking system into your applications</p>
            </div>

            <div className="grid-container">
              <div className="api-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faKey} className="section-icon" />
                  <h2>Your API Key</h2>
                </div>
                <div className="api-key-container">
                  <input 
                    type="text" 
                    value={apiKey || 'Generate an API key to get started'} 
                    readOnly 
                  />
                  <button 
                    className="action-button copy"
                    onClick={() => copyToClipboard(apiKey)}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    className="action-button generate"
                    onClick={() => {/* Generate key logic */}}
                  >
                    <FontAwesomeIcon icon={faRotate} />
                    Generate New Key
                  </button>
                </div>
              </div>

              <div className="api-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faServer} className="section-icon" />
                  <h2>Endpoints</h2>
                </div>

                <div className="endpoint">
                  <div className="endpoint-header">
                    <h3>Check Cards</h3>
                    <span className="method">GET</span>
                  </div>
                  <code>
                    /api/check?key={'{YOUR_API_KEY}'}&lista={'{CC|MM|YY|CVV}'}&gate={'{GATE_TYPE}'}
                  </code>
                  <div className="params">
                    <h4>Parameters:</h4>
                    <ul>
                      <li><span className="param-name">key</span> Your API key</li>
                      <li><span className="param-name">lista</span> Card data in format CC|MM|YY|CVV</li>
                      <li><span className="param-name">gate</span> Gate type (adyen/premium)</li>
                    </ul>
                  </div>
                </div>

                <div className="endpoint">
                  <div className="endpoint-header">
                    <h3>Check Balance</h3>
                    <span className="method">GET</span>
                  </div>
                  <code>
                    /api/balance?key={'{YOUR_API_KEY}'}
                  </code>
                </div>
              </div>

              <div className="api-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faShieldHalved} className="section-icon" />
                  <h2>Security</h2>
                </div>
                <div className="security-features">
                  <div className="feature">
                    <FontAwesomeIcon icon={faLock} />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>DDoS Protection</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Rate Limiting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </>
      )}

      <style jsx>{`
        .api-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .api-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 40px;
          padding: 60px 20px;
          background: rgba(0,255,68,0.03);
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
        }

        .hero-icon {
          font-size: 3rem;
          color: #00ff44;
          margin-bottom: 20px;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 15px;
        }

        .hero-section p {
          color: #888;
          font-size: 1.1rem;
        }

        .grid-container {
          display: grid;
          gap: 30px;
        }

        .api-section {
          background: rgba(0,255,68,0.03);
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: 30px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .section-icon {
          color: #00ff44;
          font-size: 1.5rem;
        }

        h2 {
          color: #00ff44;
          font-size: 1.5rem;
          margin: 0;
        }

        .api-key-container {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        input {
          flex: 1;
          min-width: 300px;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(0,255,68,0.1);
          background: rgba(0,0,0,0.3);
          color: #00ff44;
          font-family: monospace;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 25px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .action-button.copy {
          background: rgba(0,255,68,0.1);
          color: #00ff44;
        }

        .action-button.generate {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,255,68,0.2);
        }

        .endpoint {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .endpoint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .endpoint h3 {
          color: #00ff44;
          margin: 0;
        }

        .method {
          background: rgba(0,255,68,0.1);
          color: #00ff44;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        code {
          display: block;
          background: #111;
          padding: 15px;
          border-radius: 8px;
          color: #00ff44;
          font-family: monospace;
          overflow-x: auto;
          margin: 15px 0;
        }

        .params h4 {
          color: #888;
          margin: 20px 0 10px;
        }

        .params ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .params li {
          color: #888;
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .param-name {
          color: #00ff44;
          background: rgba(0,255,68,0.1);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
        }

        .security-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
          padding: 15px;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
        }

        .feature svg {
          color: #00ff44;
        }

        @media (max-width: 768px) {
          .api-container {
            padding: 20px;
          }

          .hero-section {
            padding: 40px 20px;
          }

          .hero-section h1 {
            font-size: 2rem;
          }

          input {
            min-width: 100%;
          }

          .action-button {
            width: 100%;
            justify-content: center;
          }

          .security-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
