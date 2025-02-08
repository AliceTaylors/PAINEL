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
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ApiDocs() {
  const [user, setUser] = useState(null);
  const router = useRouter();

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
    }

    getUser();
  }, []);

  return (
    <div className="api-page">
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>

      {user && (
        <>
          <Header user={user} />
          
          <div className="api-container">
            <div className="api-header">
              <FontAwesomeIcon icon={faCode} className="api-icon" />
              <h1>API Documentation</h1>
            </div>

            <div className="api-content">
              <div className="api-section">
                <h2>
                  <FontAwesomeIcon icon={faServer} /> Endpoints
                </h2>
                <div className="endpoint">
                  <div className="endpoint-header">
                    <h3>Check Cards</h3>
                    <span className="method">GET</span>
                  </div>
                  <div className="endpoint-url">
                    /api/check?key={'{YOUR_API_KEY}'}&lista={'{CC|MM|YY|CVV}'}&gate={'{GATE_TYPE}'}
                  </div>
                  <div className="params">
                    <h4>Parameters:</h4>
                    <ul>
                      <li><span className="param">key</span> Your API key</li>
                      <li><span className="param">lista</span> Card data in format CC|MM|YY|CVV</li>
                      <li><span className="param">gate</span> Gate type (adyen/premium)</li>
                    </ul>
                  </div>
                </div>

                <div className="endpoint">
                  <div className="endpoint-header">
                    <h3>Check Balance</h3>
                    <span className="method">GET</span>
                  </div>
                  <div className="endpoint-url">
                    /api/balance?key={'{YOUR_API_KEY}'}
                  </div>
                </div>
              </div>

              <div className="api-section">
                <h2>
                  <FontAwesomeIcon icon={faCheckCircle} /> Response Examples
                </h2>
                <div className="response-examples">
                  <div className="response live">
                    <h4>Live Card</h4>
                    <pre>
{`{
  "status": "live",
  "msg": "#LIVE - Card Approved",
  "balance": "49.80"
}`}
                    </pre>
                  </div>

                  <div className="response die">
                    <h4>Die Card</h4>
                    <pre>
{`{
  "status": "die",
  "msg": "#DIE - Card Declined",
  "balance": "50.00"
}`}
                    </pre>
                  </div>

                  <div className="response error">
                    <h4>Error</h4>
                    <pre>
{`{
  "status": "error",
  "msg": "Insufficient funds",
  "balance": "0.00"
}`}
                    </pre>
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

        .api-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .api-icon {
          font-size: 3rem;
          color: #00ff44;
          margin-bottom: 20px;
        }

        .api-header h1 {
          font-size: 2.5rem;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .api-section {
          background: rgba(0,255,68,0.03);
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: 30px;
          margin-bottom: 30px;
        }

        .api-section h2 {
          color: #00ff44;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
          font-size: 1.5rem;
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

        .endpoint-url {
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

        .param {
          color: #00ff44;
          background: rgba(0,255,68,0.1);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
        }

        .response-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .response {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 20px;
        }

        .response h4 {
          color: #00ff44;
          margin: 0 0 15px 0;
        }

        .response pre {
          background: #111;
          padding: 15px;
          border-radius: 8px;
          color: #888;
          font-family: monospace;
          overflow-x: auto;
          margin: 0;
        }

        .response.live pre {
          color: #00ff44;
        }

        .response.die pre {
          color: #ff4444;
        }

        .response.error pre {
          color: #ffaa00;
        }

        @media (max-width: 768px) {
          .api-container {
            padding: 20px;
          }

          .api-header h1 {
            font-size: 2rem;
          }

          .endpoint-url {
            font-size: 0.9rem;
          }

          .response-examples {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
