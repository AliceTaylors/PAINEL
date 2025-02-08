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
    <>
      <Head>
        <title>CHECKERCC | API Documentation</title>
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
                with your API key.
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
                  <FontAwesomeIcon icon={faLock} /> Required parameters for
                  authentication and card checking.
                </small>
                <br />
                <br />
                <div className="request-response">
                  user: Your username
                  <br />
                  password: Your password
                  <br />
                  checker: adyen or premium
                  <br />
                  lista: Card data in format CC|MM|YY|CVV
                </div>
                <br />
                <span className="title-highlight">Response</span>
                <br />
                <small>
                  <FontAwesomeIcon icon={faRocket} /> Example responses from our
                  API.
                </small>
                <br />
                <br />
                <div className="request-response">
                  <FontAwesomeIcon icon={faCheckCircle} color="greenyellow" />{" "}
                  Live:
                  <br />
                  {"{"}
                  <br />
                  status: "live",
                  <br />
                  msg: "#LIVE - Card Approved",
                  <br />
                  balance: "49.80"
                  <br />
                  {"}"}
                  <br />
                  <br />
                  <FontAwesomeIcon icon={faTimesCircle} color="tomato" /> Die:
                  <br />
                  {"{"}
                  <br />
                  status: "die",
                  <br />
                  msg: "#DIE - Card Declined",
                  <br />
                  balance: "50.00"
                  <br />
                  {"}"}
                  <br />
                  <br />
                  <FontAwesomeIcon icon={faInfoCircle} /> Error:
                  <br />
                  {"{"}
                  <br />
                  status: "error",
                  <br />
                  msg: "Insufficient funds",
                  <br />
                  balance: "0.00"
                  <br />
                  {"}"}
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

        small {
          color: #888;
          display: inline-block;
          margin: 5px 0;
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
