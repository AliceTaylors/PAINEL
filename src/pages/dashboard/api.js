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

export default function Api() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChecker, setSelectedChecker] = useState('adyen');

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch('/api/sessions', {
        headers: { token: localStorage.getItem('token') },
      });
      const data = await res.json();
      if (!data.error) setUser(data.user);
    };
    getUser();
  }, []);

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
    <>
      <Head>
        <title>CHECKERCC | API Documentation</title>
      </Head>
      {user && (
        <div className="root" style={{ width: '80%' }}>
          <Header user={user} />

          <div className="api-docs" style={{ padding: '20px', background: '#111', borderRadius: '10px', marginTop: '20px' }}>
            <div className="api-header" style={{ marginBottom: '30px', borderBottom: '2px solid #222', paddingBottom: '20px' }}>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faCode} style={{ color: '#00ff00' }} />
                API Documentation
              </h1>
              <p style={{ color: '#888', fontSize: '1.1em' }}>Integrate our powerful checking tools into your application</p>
            </div>

            <div className="api-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              {['overview', 'authentication', 'checkers', 'responses'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#222' : 'transparent',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    color: activeTab === tab ? '#00ff00' : '#fff',
                    cursor: 'pointer',
                    fontSize: '1.1em'
                  }}
                >
                  <FontAwesomeIcon icon={
                    tab === 'overview' ? faInfoCircle :
                    tab === 'authentication' ? faLock :
                    tab === 'checkers' ? faCreditCard :
                    faServer
                  } style={{ marginRight: '8px' }} />
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="api-section">
                <h2><FontAwesomeIcon icon={faRocket} style={{ marginRight: '10px', color: '#00ff00' }} />Quick Start</h2>
                <div className="endpoint-box" style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                  <h3 style={{ color: '#00ff00', marginBottom: '15px' }}>Base URL</h3>
                  <code style={{ background: '#1a1a1a', padding: '15px', borderRadius: '5px', display: 'block', position: 'relative' }}>
                    GET https://{window.location.host}/api/external-check?user={user?.login}&password=YOUR_PASSWORD&checker=TYPE&lista=CC|MM|YYYY|CVV
                  </code>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="api-section">
                <h2><FontAwesomeIcon icon={faLock} style={{ marginRight: '10px', color: '#00ff00' }} />Authentication</h2>
                <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                  <h3>Required Parameters</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ margin: '10px 0', padding: '10px', background: '#1a1a1a', borderRadius: '5px' }}>
                      <code>user</code> - Your username
                    </li>
                    <li style={{ margin: '10px 0', padding: '10px', background: '#1a1a1a', borderRadius: '5px' }}>
                      <code>password</code> - Your password
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'checkers' && (
              <div className="api-section">
                <div style={{ marginBottom: '20px' }}>
                  <button
                    onClick={() => setSelectedChecker('adyen')}
                    style={{
                      background: selectedChecker === 'adyen' ? '#00ff00' : '#222',
                      color: selectedChecker === 'adyen' ? '#000' : '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      marginRight: '10px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Adyen
                  </button>
                  <button
                    onClick={() => setSelectedChecker('premium')}
                    style={{
                      background: selectedChecker === 'premium' ? '#00ff00' : '#222',
                      color: selectedChecker === 'premium' ? '#000' : '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Premium
                  </button>
                </div>

                <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px' }}>
                  <h2 style={{ color: '#00ff00', marginBottom: '20px' }}>{checkerDetails[selectedChecker].name}</h2>
                  <p style={{ color: '#888', marginBottom: '20px' }}>{checkerDetails[selectedChecker].description}</p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Pricing</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px' }}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#00ff00', marginRight: '5px' }} />
                        Live: {checkerDetails[selectedChecker].pricing.live}
                      </div>
                      <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px' }}>
                        <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#ff4444', marginRight: '5px' }} />
                        Die: {checkerDetails[selectedChecker].pricing.die}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Usage Limit</h3>
                    <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px' }}>
                      {checkerDetails[selectedChecker].maxDies}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Example Request</h3>
                    <code style={{ background: '#1a1a1a', padding: '15px', borderRadius: '5px', display: 'block', overflowX: 'auto' }}>
                      GET /api/external-check?user=USERNAME&password=PASS&checker={selectedChecker}&lista={checkerDetails[selectedChecker].example}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'responses' && (
              <div className="api-section">
                <h2><FontAwesomeIcon icon={faServer} style={{ marginRight: '10px', color: '#00ff00' }} />Response Examples</h2>
                <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                  {Object.entries(checkerDetails[selectedChecker].responses).map(([type, response]) => (
                    <div key={type} style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px' }}>
                      <h3 style={{ 
                        color: type === 'live' ? '#00ff00' : type === 'die' ? '#ff4444' : '#ffaa00',
                        marginBottom: '10px'
                      }}>
                        {type.toUpperCase()} Response
                      </h3>
                      <pre style={{ background: '#1a1a1a', padding: '15px', borderRadius: '5px', overflowX: 'auto' }}>
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Footer />
        </div>
      )}
      <style jsx>{`
        .api-docs {
          font-family: 'Inter', sans-serif;
        }
        code {
          font-family: 'Fira Code', monospace;
        }
        .api-section {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
