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
  faGem
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
    <>
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>
      {user && (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />

          <div className="api-docs">
            <h2>
              <FontAwesomeIcon icon={faCode} /> API Documentation
            </h2>

            <div>
              <span className="endpoint">
                <FontAwesomeIcon icon={faServer} /> Endpoints
              </span>
              <br />
              <small>
                <FontAwesomeIcon icon={faInfoCircle} /> All requests must be made
                with your credentials.
              </small>
              <br />
              <br />
              <div>
                <span className="title-highlight">Check Cards</span>
                <br />
                <small>
                  <FontAwesomeIcon icon={faCreditCard} /> Check your cards using
                  our API.
                </small>
                <br />
                <br />
                <div className="request-response">
                  <code>
                    https://www.seccx.pro/api/external-check?user=USERNAME&password=PASSWORD&checker=TYPE&lista=CC|MM|YY|CVV
                  </code>
                </div>
                <br />
                <span className="title-highlight">Parameters</span>
                <br />
                <small>
                  <FontAwesomeIcon icon={faInfoCircle} /> Required parameters for API requests.
                </small>
                <br />
                <br />
                <div className="params">
                  <ul>
                    <li><strong>user:</strong> Your username</li>
                    <li><strong>password:</strong> Your password</li>
                    <li><strong>checker:</strong> adyen ($0.50/live) or premium ($1.00/live)</li>
                    <li><strong>lista:</strong> Card in format CC|MM|YY|CVV</li>
                  </ul>
                </div>
                <br />
                <span className="title-highlight">Response Examples</span>
                <br />
                <small>
                  <FontAwesomeIcon icon={faInfoCircle} /> Example responses from our API.
                </small>
                <br />
                <br />
                <div className="request-response">
                  <FontAwesomeIcon icon={faCheckCircle} style={{color: "#00ff44"}} /> Live:
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

                  <FontAwesomeIcon icon={faTimesCircle} style={{color: "#ff4444"}} /> Die:
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

                  <FontAwesomeIcon icon={faInfoCircle} style={{color: "#ffaa00"}} /> Error:
                  <pre>
                    {JSON.stringify({
                      status: "error",
                      msg: "Insufficient funds",
                      balance: "0.00"
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      )}

      <style jsx>{`
        .api-docs {
          background: rgba(0,255,68,0.03);
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: 30px;
          margin: 20px 0;
        }

        .endpoint {
          font-size: 1.5rem;
          color: #00ff44;
        }

        .title-highlight {
          color: #00ff44;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .request-response {
          background: rgba(17,17,17,0.7);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #222;
          margin: 10px 0;
          font-family: monospace;
          overflow-x: auto;
        }

        code {
          color: #00ff44;
          word-break: break-all;
        }

        pre {
          background: #111;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          color: #888;
        }

        small {
          color: #888;
          display: inline-block;
          margin: 5px 0;
        }

        .params ul {
          list-style: none;
          padding: 0;
        }

        .params li {
          margin: 10px 0;
          color: #888;
        }

        .params strong {
          color: #00ff44;
        }

        @media (max-width: 768px) {
          .api-docs {
            padding: 20px;
          }

          .request-response {
            padding: 15px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}
