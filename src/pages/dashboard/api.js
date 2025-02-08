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
                  GET /api/external-check?user=USERNAME&password=PASSWORD&checker=TYPE&lista=CC|MM|YY|CVV
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
    </>
  );
}
