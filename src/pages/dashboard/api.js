import { useEffect, useState } from 'react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from 'next/router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faCopy, faCheck, faKey, faCreditCard, faDatabase, faWarning } from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/Api.module.css';
import Router from 'next/router';

export default function APIPage() {
  const alerts = withReactContent(Swal);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({
    adyen: false,
    premium: false
  });
  const [activeTab, setActiveTab] = useState('php');

  useEffect(() => {
    if (!window.localStorage.getItem("token")) {
      return Router.push("/");
    }
    getUser();
  }, []);

  const handleCopy = (checker) => {
    setCopied(prev => ({
      ...prev,
      [checker]: true
    }));
    setTimeout(() => {
      setCopied(prev => ({
        ...prev,
        [checker]: false
      }));
    }, 2000);
  };

  const getUser = async () => {
    try {
      const res = await axios.get("/api/sessions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (res.data.error) {
        router.push("/");
        return;
      }

      setUser(res.data.user);
      setToken(window.localStorage.getItem("token"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/");
    }
  };

  const getCodeExample = (language) => {
    const examples = {
      php: `<?php
// PHP Example - Configured for ${user?.login}
$usuario = "${user?.login}";  // Your username
$senha = "${user?.password}"; // Your password
$testador = "adyen";         // or "premium" for Premium Checker
$lista = "4532117190458043|11|2027|475";

$url = "https://seccx.pro/seccx.php";
$params = http_build_query([
    'usuario' => $usuario,
    'senha' => $senha,
    'testador' => $testador,
    'lista' => $lista
]);

$ch = curl_init($url . '?' . $params);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`,

      python: `# Python Example - Configured for ${user?.login}
import requests

usuario = "${user?.login}"   # Your username
senha = "${user?.password}"  # Your password
testador = "adyen"          # or "premium" for Premium Checker
lista = "4532117190458043|11|2027|475"

url = "https://seccx.pro/seccx.php"
params = {
    'usuario': usuario,
    'senha': senha,
    'testador': testador,
    'lista': lista
}

response = requests.get(url, params=params)
result = response.json()
print(result)`,

      javascript: `// JavaScript Example - Configured for ${user?.login}
const checkCard = async () => {
  const usuario = "${user?.login}";  // Your username
  const senha = "${user?.password}"; // Your password
  const testador = "adyen";         // or "premium" for Premium Checker
  const lista = "4532117190458043|11|2027|475";

  const params = new URLSearchParams({
    usuario,
    senha,
    testador,
    lista
  });

  const url = 'https://seccx.pro/seccx.php?' + params;
  
  const response = await fetch(url);
  const result = await response.json();
  console.log(result);
}`
    };

    return examples[language];
  };

  const codeExamples = {
    php: `<?php
// PHP Example
$token = "YOUR_TOKEN";  // Your API token
$cc = "4532117190458043|11|2027|475";
$checker = "adyen"; // or "premium" for Premium Checker

$url = "https://seccx.pro/api/checker/" . ($checker === "premium" ? "vip/" : "") . $token . "/" . $cc;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`,

    python: `# Python Example
import requests

token = "YOUR_TOKEN"  # Your API token
cc = "4532117190458043|11|2027|475"
checker = "adyen"  # or "premium" for Premium Checker

url = f"https://seccx.pro/api/checker/{'vip/' if checker == 'premium' else ''}{token}/{cc}"

response = requests.get(url)
result = response.json()
print(result)`,

    javascript: `// JavaScript Example
const checkCard = async () => {
  const token = "YOUR_TOKEN"; // Your API token
  const cc = "4532117190458043|11|2027|475";
  const checker = "adyen"; // or "premium" for Premium Checker
  
  const url = \`https://seccx.pro/api/checker/\${checker === "premium" ? "vip/" : ""}\${token}/\${cc}\`;
  
  const response = await fetch(url);
  const result = await response.json();
  console.log(result);
}`
  };

  const exampleEndpoint = `https://seccx.pro/seccx.php?usuario=USER&senha=PASS&testador=adyen&lista=453211719045XXXX|11|2027|475`;

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    Router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>SECCX.PRO | API Documentation</title>
      </Head>

      <div className="root" style={{ width: '80%' }}>
        <Header user={user} />

        <div className="api-container">
          <h1>
            <FontAwesomeIcon icon={faCode} /> API Documentation
          </h1>

          <div className="pricing-table">
            <h2>Checker Pricing</h2>
            <table>
              <thead>
                <tr>
                  <th>Checker</th>
                  <th>Live Cost</th>
                  <th>Die Cost</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Adyen</td>
                  <td>$0.50</td>
                  <td>$0.00</td>
                  <td>Basic Check</td>
                </tr>
                <tr className="premium-row">
                  <td>Premium</td>
                  <td>$1.00</td>
                  <td>$0.10</td>
                  <td>BIN Info + Enhanced Check</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="endpoints">
            <h2>API Endpoints</h2>
            
            <div className="endpoint-box">
              <h3>Base URL</h3>
              <code>https://seccx.pro/seccx.php</code>
            </div>

            <div className="endpoint-box">
              <h3>Parameters</h3>
              <ul>
                <li><code>usuario</code>: Your username</li>
                <li><code>senha</code>: Your password</li>
                <li><code>checker</code>: "adyen" or "premium"</li>
                <li><code>lista</code>: Card in format XXXXXXXXXXXXXXXX|MM|YYYY|CVV</li>
              </ul>
            </div>

            <div className="example-box">
              <h3>Example URLs</h3>
              <div className="url-box">
                <p>Adyen Checker:</p>
                <div className="copy-container">
                  <code>https://seccx.pro/seccx.php?usuario={user?.login}&senha=PASS&checker=adyen&lista=4532117190458043|11|2027|475</code>
                  <CopyToClipboard 
                    text={`https://seccx.pro/seccx.php?usuario=${user?.login}&senha=${user?.password}&checker=adyen&lista=4532117190458043|11|2027|475`}
                    onCopy={() => handleCopy('adyen')}
                  >
                    <button>{copied.adyen ? 'Copied!' : 'Copy'}</button>
                  </CopyToClipboard>
                </div>

                <p>Premium Checker:</p>
                <div className="copy-container">
                  <code>https://seccx.pro/seccx.php?usuario={user?.login}&senha=PASS&checker=premium&lista=4532117190458043|11|2027|475</code>
                  <CopyToClipboard 
                    text={`https://seccx.pro/seccx.php?usuario=${user?.login}&senha=${user?.password}&checker=premium&lista=4532117190458043|11|2027|475`}
                    onCopy={() => handleCopy('premium')}
                  >
                    <button>{copied.premium ? 'Copied!' : 'Copy'}</button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <div className="responses">
              <h3>Response Examples</h3>
              
              <div className="response-box">
                <h4>Adyen Checker</h4>
                <div className="response live">
                  <h5>Live:</h5>
                  <pre>{JSON.stringify({
                    error: false,
                    retorno: "Approved"
                  }, null, 2)}</pre>
                </div>
                <div className="response die">
                  <h5>Die:</h5>
                  <pre>{JSON.stringify({
                    error: true,
                    retorno: "Cartão Invalido!"
                  }, null, 2)}</pre>
                </div>
              </div>

              <div className="response-box">
                <h4>Premium Checker</h4>
                <div className="response live">
                  <h5>Live:</h5>
                  <pre>{JSON.stringify({
                    error: false,
                    retorno: "Approved",
                    bin_info: {
                      brand: "VISA",
                      type: "CREDIT",
                      level: "PLATINUM",
                      bank: "CHASE",
                      country: "UNITED STATES",
                      flag: "🇺🇸"
                    }
                  }, null, 2)}</pre>
                </div>
                <div className="response die">
                  <h5>Die:</h5>
                  <pre>{JSON.stringify({
                    error: true,
                    retorno: "Cartão Invalido!"
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="warning-box">
              <FontAwesomeIcon icon={faWarning} />
              <p>Account will be blocked after 20 consecutive dies in 24h</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .api-container {
          padding: 20px;
          color: #fff;
        }

        .pricing-table table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #111;
        }

        .pricing-table th, .pricing-table td {
          padding: 12px;
          border: 1px solid #333;
          text-align: left;
        }

        .pricing-table .premium-row {
          background: #1a1a1a;
        }

        .endpoint-box, .example-box, .response-box {
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .copy-container {
          display: flex;
          gap: 10px;
          align-items: center;
          background: #1a1a1a;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .copy-container button {
          padding: 8px 16px;
          background: #333;
          border: none;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
        }

        .copy-container button:hover {
          background: #444;
        }

        .response {
          margin: 10px 0;
          padding: 15px;
          border-radius: 4px;
        }

        .response.live {
          background: #1a2f1a;
        }

        .response.die {
          background: #2f1a1a;
        }

        .warning-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #2f1a1a;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }

        pre {
          background: #1a1a1a;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </>
  );
}
