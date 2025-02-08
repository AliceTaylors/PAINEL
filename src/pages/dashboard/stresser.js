import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer,
  faGlobe,
  faRocket,
  faClock,
  faShieldHalved,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function Stresser() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const alerts = withReactContent(Swal);
  const [loading, setLoading] = useState(false);
  const [attackType, setAttackType] = useState('layer4');
  const [target, setTarget] = useState('');
  const [port, setPort] = useState('80');
  const [time, setTime] = useState(60);
  const [method, setMethod] = useState('UDP');
  const [activeAttacks, setActiveAttacks] = useState([]);

  // Layer 7 Methods
  const l7Methods = ['HTTP-FLOOD', 'HTTP-RAW', 'HTTP-RAND', 'HTTP-SOCKET'];
  // Layer 4 Methods  
  const l4Methods = ['UDP', 'TCP', 'SYN', 'ACK'];

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
      getActiveAttacks();
    }

    getUser();
  }, []);

  const getActiveAttacks = async () => {
    try {
      const res = await axios.get('/api/stresser/attacks', {
        headers: { token: window.localStorage.getItem('token') }
      });
      setActiveAttacks(res.data.attacks);
    } catch (error) {
      console.error('Error fetching attacks:', error);
    }
  };

  const calculateCost = () => {
    const baseRate = 0.50; // $0.50 per minute
    return (time * baseRate).toFixed(2);
  };

  const handleAttack = async (e) => {
    e.preventDefault();

    // Validações
    if (!target) {
      return alerts.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a target'
      });
    }

    const cost = calculateCost();
    if (user.balance < cost) {
      return alerts.fire({
        icon: 'warning',
        title: 'Insufficient Balance',
        html: `You need $${cost} for this attack.<br/>Current balance: $${user.balance.toFixed(2)}`,
      });
    }

    // Confirmar ataque
    const result = await alerts.fire({
      icon: 'warning',
      title: 'Confirm Attack',
      html: `
        <div>
          <p>Target: ${target}</p>
          <p>Duration: ${time} seconds</p>
          <p>Method: ${method}</p>
          <p>Cost: $${cost}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Launch Attack',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/stresser/attack', {
        target,
        port: attackType === 'layer4' ? port : null,
        time,
        method,
        type: attackType
      }, {
        headers: { token: window.localStorage.getItem('token') }
      });

      alerts.fire({
        icon: 'success',
        title: 'Attack Launched',
        text: 'Your attack has been started successfully!'
      });

      getActiveAttacks();
      
      // Update user balance
      const userRes = await axios.get('/api/sessions', {
        headers: { token: window.localStorage.getItem('token') }
      });
      setUser(userRes.data.user);

    } catch (error) {
      alerts.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to launch attack'
      });
    }
    setLoading(false);
  };

  return (
    <div className="stresser-page">
      <Head>
        <title>SECCX.PRO | IP Stresser</title>
      </Head>

      <div className="container">
        <Header user={user} />
        
        <div className="content">
          <div className="stresser-header">
            <h1>
              <FontAwesomeIcon icon={faRocket} className="icon-glow" />
              IP Stresser
            </h1>
            <p>Professional DDoS Stress Testing Platform</p>
          </div>

          <div className="attack-types">
            <div 
              className={`attack-type ${attackType === 'layer4' ? 'active' : ''}`}
              onClick={() => setAttackType('layer4')}
            >
              <FontAwesomeIcon icon={faServer} />
              <h3>Layer 4 Attack</h3>
              <p>UDP, TCP, SYN Floods</p>
            </div>
            <div 
              className={`attack-type ${attackType === 'layer7' ? 'active' : ''}`}
              onClick={() => setAttackType('layer7')}
            >
              <FontAwesomeIcon icon={faGlobe} />
              <h3>Layer 7 Attack</h3>
              <p>HTTP, Socket Floods</p>
            </div>
          </div>

          <div className="attack-form">
            <form onSubmit={handleAttack}>
              <div className="form-group">
                <label>Target:</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={attackType === 'layer4' ? 'Enter IP address' : 'Enter URL'}
                />
              </div>

              {attackType === 'layer4' && (
                <div className="form-group">
                  <label>Port:</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="Port (default: 80)"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Method:</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {attackType === 'layer4' 
                    ? l4Methods.map(m => <option key={m} value={m}>{m}</option>)
                    : l7Methods.map(m => <option key={m} value={m}>{m}</option>)
                  }
                </select>
              </div>

              <div className="form-group">
                <label>Duration (seconds):</label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(parseInt(e.target.value))}
                  min="60"
                  max="3600"
                />
              </div>

              <div className="cost-display">
                Estimated Cost: ${calculateCost()}
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Launching...' : 'Launch Attack'}
              </button>
            </form>
          </div>

          {activeAttacks.length > 0 && (
            <div className="active-attacks">
              <h3>
                <FontAwesomeIcon icon={faClock} /> Active Attacks
              </h3>
              <div className="attacks-grid">
                {activeAttacks.map((attack) => (
                  <div key={attack._id} className="attack-card">
                    <div className="attack-info">
                      <span className="target">{attack.target}</span>
                      <span className="method">{attack.method}</span>
                      <span className="time">
                        {attack.timeRemaining}s remaining
                      </span>
                    </div>
                    <div className="attack-status">
                      Running
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .stresser-page {
          min-height: 100vh;
          background: #000;
          color: #fff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .stresser-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .stresser-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #00ff44;
        }

        .icon-glow {
          filter: drop-shadow(0 0 10px #00ff44);
          margin-right: 1rem;
        }

        .attack-types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .attack-type {
          background: #111;
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #222;
        }

        .attack-type.active {
          border-color: #00ff44;
          box-shadow: 0 0 20px rgba(0,255,68,0.1);
        }

        .attack-type svg {
          font-size: 2rem;
          color: #00ff44;
          margin-bottom: 1rem;
        }

        .attack-form {
          background: #111;
          padding: 2rem;
          border-radius: 10px;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #888;
        }

        input, select {
          width: 100%;
          padding: 0.8rem;
          background: #000;
          border: 1px solid #222;
          border-radius: 5px;
          color: #fff;
          margin-top: 0.3rem;
        }

        .cost-display {
          background: #222;
          padding: 1rem;
          border-radius: 5px;
          text-align: center;
          color: #00ff44;
          margin-bottom: 1rem;
        }

        button {
          width: 100%;
          padding: 1rem;
          background: #00ff44;
          color: #000;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          background: #00cc33;
        }

        button:disabled {
          background: #333;
          cursor: not-allowed;
        }

        .active-attacks {
          background: #111;
          padding: 2rem;
          border-radius: 10px;
        }

        .attacks-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .attack-card {
          background: #000;
          padding: 1rem;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .attack-info {
          display: flex;
          gap: 1rem;
        }

        .attack-status {
          color: #00ff44;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .attack-types {
            grid-template-columns: 1fr;
          }

          .attack-info {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
} 
