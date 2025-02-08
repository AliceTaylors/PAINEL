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
  faGem,
  faList,
  faExchange
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
    <div className="api-docs">
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>

      <div className="container">
        <Header user={user} />
        
        <div className="content">
          <div className="api-header">
            <h1>
              <FontAwesomeIcon icon={faCode} className="icon-glow" /> 
              API Documentation
            </h1>
            <p>Integrate our checker directly into your application</p>
          </div>

          <div className="api-section">
            <h2>
              <FontAwesomeIcon icon={faServer} className="icon-pulse" /> 
              Endpoint
            </h2>
            <div className="endpoint-url">
              <code>
                https://www.seccx.pro/api/external-check?user=YOUR_USERNAME&password=YOUR_PASSWORD&checker=CHECKER_TYPE&lista=CC|MM|YY|CVV
              </code>
              <div className="endpoint-example">
                <span className="example-label">Example:</span>
                <code>
                  https://www.seccx.pro/api/external-check?user=john&password=123456&checker=premium&lista=4111111111111111|12|25|123
                </code>
              </div>
            </div>

            <div className="params-section">
              <h3>
                <FontAwesomeIcon icon={faList} /> 
                Parameters
              </h3>
              <div className="params-grid">
                <div className="param-item">
                  <span className="param-name">user</span>
                  <span className="param-desc">Your username</span>
                </div>
                <div className="param-item">
                  <span className="param-name">password</span>
                  <span className="param-desc">Your password</span>
                </div>
                <div className="param-item">
                  <span className="param-name">checker</span>
                  <span className="param-desc">adyen or premium</span>
                </div>
                <div className="param-item">
                  <span className="param-name">lista</span>
                  <span className="param-desc">CC|MM|YY|CVV format</span>
                </div>
              </div>
            </div>

            <div className="response-section">
              <h3>
                <FontAwesomeIcon icon={faExchange} /> 
                Response Examples
              </h3>
              
              <div className="response-grid">
                <div className="response-card success">
                  <div className="response-header">
                    <FontAwesomeIcon icon={faCheckCircle} /> Live Response
                  </div>
                  <pre>
                    {JSON.stringify({
                      status: "live",
                      msg: "#LIVE - Pagamento Aprovado",
                      balance: "49.50",
                      details: {
                        number: "4111111111111111",
                        checker: "ADYEN",
                        time: new Date().toISOString()
                      }
                    }, null, 2)}
                  </pre>
                </div>

                <div className="response-card error">
                  <div className="response-header">
                    <FontAwesomeIcon icon={faTimesCircle} /> Die Response
                  </div>
                  <pre>
                    {JSON.stringify({
                      status: "die",
                      msg: "#DIE - Cartão Recusado",
                      balance: "50.00",
                      details: {
                        number: "4111111111111111",
                        checker: "PREMIUM",
                        time: new Date().toISOString()
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .api-docs {
          min-height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .content {
          flex: 1;
        }

        .api-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .api-header h1 {
          font-size: 2.5rem;
          color: #00ff44;
          margin-bottom: 1rem;
        }

        .api-header p {
          color: #888;
          font-size: 1.1rem;
        }

        .icon-glow {
          filter: drop-shadow(0 0 8px #00ff44);
        }

        .icon-pulse {
          animation: pulse 2s infinite;
        }

        .api-section {
          background: rgba(17,17,17,0.7);
          border: 1px solid #222;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .endpoint-url {
          background: #111;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-family: monospace;
          border: 1px solid #222;
        }

        .endpoint-url code {
          color: #00ff44;
          word-break: break-all;
          display: block;
          line-height: 1.5;
        }

        .endpoint-example {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #222;
        }

        .example-label {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .endpoint-example code {
          color: #888;
          font-size: 0.9rem;
        }

        .params-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .param-item {
          background: #111;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #222;
        }

        .param-name {
          color: #00ff44;
          font-family: monospace;
          display: block;
          margin-bottom: 0.5rem;
        }

        .param-desc {
          color: #888;
          font-size: 0.9rem;
        }

        .response-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .response-card {
          background: #111;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #222;
        }

        .response-header {
          padding: 1rem;
          font-weight: bold;
          border-bottom: 1px solid #222;
        }

        .success .response-header {
          color: #00ff44;
        }

        .error .response-header {
          color: #ff4444;
        }

        pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          font-family: monospace;
          font-size: 0.9rem;
        }

        h2, h3 {
          color: #00ff44;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .api-header h1 {
            font-size: 2rem;
          }

          .response-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
