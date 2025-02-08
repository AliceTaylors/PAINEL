import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faKey,
  faLock,
  faServer,
  faGear,
  faDatabase,
  faBolt,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Header from '../../components/Header';

export default function API() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

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

  async function generateKey() {
    const res = await axios.post('/api/generate-key', null, {
      headers: { token: window.localStorage.getItem('token') }
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    setApiKey(res.data.apiKey);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="api-page">
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>

      {user ? (
        <>
          <Header user={user} />
          
          <div className="api-container">
            <div className="sidebar">
              <div className="menu-items">
                <button className="menu-item">
                  <FontAwesomeIcon icon={faKey} />
                  <span>API Key</span>
                </button>
                <button className="menu-item">
                  <FontAwesomeIcon icon={faCode} />
                  <span>Documentation</span>
                </button>
                <button className="menu-item">
                  <FontAwesomeIcon icon={faServer} />
                  <span>Endpoints</span>
                </button>
              </div>
            </div>

            <div className="content">
              <div className="api-section">
                <h2>
                  <FontAwesomeIcon icon={faKey} /> API Key
                </h2>
                <div className="api-key-container">
                  <input 
                    type="text" 
                    value={apiKey} 
                    readOnly 
                    placeholder="Generate your API key"
                  />
                  <button onClick={() => copyToClipboard(apiKey)} className="copy-button">
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={generateKey} className="generate-button">
                    Generate New Key
                  </button>
                </div>
              </div>

              <div className="api-section">
                <h2>
                  <FontAwesomeIcon icon={faCode} /> API Documentation
                </h2>
                <div className="docs-container">
                  <div className="endpoint">
                    <h3>Check Cards</h3>
                    <pre>
                      GET /api/external-check?user=USERNAME&password=PASSWORD&checker=TYPE&lista=CC|MM|YY|CVV
                    </pre>
                    <div className="params">
                      <h4>Parameters:</h4>
                      <ul>
                        <li><strong>user:</strong> Your username</li>
                        <li><strong>password:</strong> Your password</li>
                        <li><strong>checker:</strong> adyen or premium</li>
                        <li><strong>lista:</strong> Card data in format CC|MM|YY|CVV</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <style jsx>{`
        .api-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .api-container {
          display: flex;
          padding: 20px;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sidebar {
          width: 250px;
          background: rgba(0,255,68,0.03);
          border-radius: 15px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: 20px;
          height: fit-content;
          position: sticky;
          top: 90px;
        }

        .menu-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-align: left;
        }

        .menu-item:hover {
          background: rgba(0,255,68,0.1);
        }

        .content {
          flex: 1;
        }

        .api-section {
          background: rgba(0,255,68,0.03);
          border-radius: 15px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        .api-section h2 {
          color: #00ff44;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .api-key-container {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        input {
          flex: 1;
          min-width: 300px;
          padding: 12px 15px;
          border-radius: 10px;
          border: 1px solid #222;
          background: rgba(17,17,17,0.7);
          color: #fff;
          font-family: monospace;
        }

        .copy-button, .generate-button {
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .copy-button {
          background: rgba(0,255,68,0.1);
          color: #00ff44;
        }

        .generate-button {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
        }

        .endpoint {
          background: rgba(17,17,17,0.7);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .endpoint h3 {
          color: #00ff44;
          margin-bottom: 15px;
        }

        pre {
          background: #111;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: monospace;
          margin: 10px 0;
        }

        .params h4 {
          color: #666;
          margin: 15px 0 10px;
        }

        .params ul {
          list-style: none;
          padding: 0;
        }

        .params li {
          margin: 5px 0;
          color: #888;
        }

        .params strong {
          color: #00ff44;
        }

        @media (max-width: 768px) {
          .api-container {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            position: static;
          }

          .menu-items {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
          }

          .menu-item {
            width: auto;
          }

          input {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
} 
