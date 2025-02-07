import { useEffect, useState } from 'react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from 'next/router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket,
  faTrash,
  faCreditCard,
  faBitcoinSign,
  faCartShopping,
  faKey,
  faDatabase,
  faCartPlus,
  faPersonCircleCheck,
  faFire,
  faAdd,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Header from '../../components/Header';
import AccountDetails from '../../components/AccountDetails';
import Footer from '../../components/Footer';
import { checkToken } from '../../services/jwt';
import User from '../../models/User';
import crypto from 'crypto';

export default function Api() {
  const alerts = withReactContent(Swal);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [cc, setCc] = useState(null);
  const [requestResponse, setRequestResponse] = useState(null);
  const [requestBody, setRequestBody] = useState(null);
  const [hasSent, setSent] = useState(false);

  const getUser = async () => {
    setToken(window.localStorage.getItem('token'));
    const res = await axios.get('/api/sessions', {
      headers: { token: window.localStorage.getItem('token') },
    });

    if (res.data.error) {
      router.push('/');
    }

    setUser(res.data.user);
  };

  const handleRequest = async (e) => {
    setRequestBody(JSON.stringify({ cc }, null, 4));
    e.preventDefault();
    const res = await axios.post(
      '/api/checks',
      { cc },
      { headers: { token: window.localStorage.getItem('token') } }
    );

    const data = res.data;

    setRequestResponse(data);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <Head>
        <title>CHECKERCC | API Documentation</title>
      </Head>
      {user && (
        <div className="root" style={{ width: '80%' }}>
          <Header user={user} />

          <div>
            <h2 style={{ marginBottom: 0 }}>API Documentation</h2>
            <small>Integrate our tools to your app or service.</small>
          </div>
          <div className="api-docs">
            <form action="" onSubmit={handleRequest}>
              <span className="endpoint">
                <FontAwesomeIcon icon={faAdd} /> POST /checks
              </span>
              <small></small>

              <span>
                URL:{' '}
                <CopyToClipboard
                  text={window.location.hostname + '/api/checks'}
                  onCopy={() =>
                    alerts.fire({
                      icon: 'success',
                      text: 'Copied to clipboard!',
                      timer: 500,
                    })
                  }
                >
                  <button
                    type="button"
                    style={{
                      padding: '2px',
                      fontSize: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    Copy
                  </button>
                </CopyToClipboard>
              </span>
              <input
                type="text"
                disabled
                value={'https://' + window.location.hostname + '/api/checks'}
              />

              <br />

              <span>
                {'Token:'}{' '}
                <CopyToClipboard
                  text={token}
                  onCopy={() =>
                    alerts.fire({
                      icon: 'success',
                      text: 'Copied to clipboard!',
                      timer: 500,
                    })
                  }
                >
                  <button
                    style={{
                      padding: '2px',
                      fontSize: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    Copy
                  </button>
                </CopyToClipboard>
              </span>
              <input type="text" disabled value={token} />

              <br />

              <span>{'CC: '} </span>

              <input
                style={{ opacity: 1, color: '#fff' }}
                type="text"
                onChange={(e) => setCc(e.target.value)}
                placeholder="Ex: 5000000000000000|00|0000|000"
              />
              <button type="submit" onClick={() => setSent(true)}>
                Send request
              </button>
            </form>
          </div>

          <br />
          {hasSent && (
            <>
              <h3>Request body</h3>
              <div className="request-response">{requestBody}</div>

              <br />
              <h3>Request response</h3>
              <div className="request-response">
                <pre>{JSON.stringify(requestResponse, null, 4)}</pre>
              </div>
            </>
          )}

          <Footer />
        </div>
      )}
    </>
  );
}

export async function handler(req, res) {
  // Allow CORS for external access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  if (req.method === 'GET') {
    const { user, password, checker, lista } = req.query;

    if (!user || !password || !checker || !lista) {
      return res.json({
        status: "error",
        msg: "Missing parameters"
      });
    }

    // Authenticate user
    const dbUser = await User.findOne({ login: user, password });
    if (!dbUser) {
      return res.json({
        status: "error", 
        msg: "Invalid credentials"
      });
    }

    // Format card data
    const [cc, month, year, cvv] = lista.split('|');
    if (!cc || !month || !year || !cvv) {
      return res.json({
        status: "error",
        msg: "Invalid card format. Use: CC|MM|YYYY|CVV"
      });
    }

    // Check minimum balance based on checker type
    const minBalance = checker === 'premium' ? 0.1 : 0.5;
    if (dbUser.balance < minBalance) {
      return res.json({
        status: "error",
        msg: "Insufficient funds"
      });
    }

    try {
      let API_URL;
      let liveCost;
      let dieCost;

      // Set API URL and costs based on checker type
      if (checker === 'premium') {
        API_URL = process.env.API_2_URL;
        liveCost = -1.0;
        dieCost = -0.1;
      } else if (checker === 'adyen') {
        API_URL = process.env.API_1_URL;
        liveCost = -0.2;
        dieCost = 0;
      } else {
        return res.json({
          status: "error",
          msg: "Invalid checker type"
        });
      }

      // Call checker API
      const API_RESULT = await axios.get(API_URL + lista);

      if (API_RESULT.data.error) {
        // Handle die result
        await dbUser.updateOne({
          logs: [
            {
              history_type: `${checker.toUpperCase()} DIE`,
              cost: dieCost,
              data: lista,
            },
            ...dbUser.logs,
          ],
          $inc: {
            balance: dieCost,
          },
        });

        return res.json({
          status: "error",
          msg: API_RESULT.data.retorno,
          balance: (dbUser.balance + dieCost).toFixed(2)
        });
      }

      if (API_RESULT.data.success) {
        // Check balance for live cost
        if (dbUser.balance < Math.abs(liveCost)) {
          return res.json({
            status: "error",
            msg: "Insufficient funds for live check"
          });
        }

        // Handle live result
        await dbUser.updateOne({
          logs: [
            {
              history_type: `${checker.toUpperCase()} LIVE`,
              cost: liveCost,
              data: lista,
            },
            ...dbUser.logs,
          ],
          $inc: {
            balance: liveCost,
          },
        });

        return res.json({
          status: "approved",
          msg: API_RESULT.data.retorno,
          balance: (dbUser.balance + liveCost).toFixed(2)
        });
      }

      return res.json({
        status: "error",
        msg: "Unknown response from checker"
      });

    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error"
      });
    }
  }

  // Keep existing POST endpoint for web interface
  if (req.method === 'POST') {
    // ... existing POST handler code ...
  }
}
