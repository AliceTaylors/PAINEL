import { useEffect, useState } from 'react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from 'next/router';
import ReactLoading from 'react-loading';
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
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import versionData from '../../version.json';
import checkerSettings from '../api/utils/checkerSettings';
import Header from '../../components/Header';
import AccountDetails from '../../components/AccountDetails';
import Footer from '../../components/Footer';
import useTranslation from 'next-translate/useTranslation';
import { v4 as uuidv4 } from 'uuid';

export default function Painel() {
  const { t, lang } = useTranslation('dashboard');
  const [cards, setCards] = useState([]);
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const [isChecking, setChecking] = useState(false);
  const [list, setList] = useState(null);
  const [lives, setLives] = useState([]);
  const [dies, setDies] = useState([]);
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [checkerType, setCheckerType] = useState('adyen');

  // Definir custos dos checkers
  const checkerCosts = {
    adyen: { live: 0.50, die: 0.00 },
    premium: { live: 1.00, die: 0.10 }
  };

  const getUser = async () => {
    const res = await axios.get('/api/sessions', {
      headers: { token: window.localStorage.getItem('token') },
    });

    if (res.data.error) {
      router.push('/');
    }

    setUser(res.data.user);
  };

  const getStatus = async () => {
    const res = await axios.get('/api/status');

    setStatus(res.data);
  };

  const getData = async () => {
    function shuffle(array) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    }

    const res = await axios.get('/api/cards', {
      headers: { token: window.localStorage.getItem('token') },
    });

    if (res.data.error) {
      router.push('/');
    }
    setCards(shuffle(res.data));
  };

  useEffect(() => {
    getUser();
    getData();
    getStatus();
  }, []);

  async function handleCheck(e) {
    e.preventDefault();

    getUser();

    if (user.balance < 0.5) {
      return alerts
        .fire({
          icon: 'warning',
          html: 'Insuficient funds to check cards. <b>Add funds now</b>!',
        })
        .then(() => {
          router.push('/dashboard/wallet');
        });
    }

    setChecking(true);

    const listFormated = String(list)
      .split('\n')
      .filter((n) => n);

    if (!user) {
      router.push('/');
    }

    listFormated.forEach(async (cc, index) => {
      setTimeout(async () => {
        if (user.balance < 0.5) {
          return alerts
            .fire({
              icon: 'warning',
              html: 'Insuficient funds to check cards. <b>Recharge now</b>!',
            })
            .then(() => {
              router.push('/dashboard/wallet');
            });
        }

        const check = await axios.post(
          '/api/checks',
          {
            cc,
            checker: checkerType,
            gateway_server:
              'us-' + Math.floor(Math.random() * (20 - 1 + 1) + 1),
          },
          { headers: { token: window.localStorage.getItem('token') } }
        );

        const data = check.data;

        if (data.success) {
          setLives((old) => [data, ...old]);
        } else {
          setDies((old) => [data, ...old]);
        }

        if (listFormated.length - 1 == lives.length + dies.length) {
          alerts.fire({
            icon: 'success',
            html: 'Ready!<br/>' + listFormated.length + ' card(s) checked!',
          });
        }
      }, 3000 * index);
    });
  }

  async function handleStop(e) {
    alerts
      .fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Do you really want to stop and go back home?',
        showCancelButton: true,
        confirmButtonText: 'GO TO HOME',
      })
      .then((e) => {
        if (e.isConfirmed) {
          window.location.reload();
        }
      });
  }

  const handleClearResults = () => {
    alerts.fire({
      icon: 'warning',
      title: 'Clear Results',
      text: 'Do you want to clear all results?',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear',
      cancelButtonText: 'No, keep'
    }).then((result) => {
      if (result.isConfirmed) {
        setLives([]);
        setDies([]);
        setList('');
      }
    });
  };

  const renderCardResult = (result) => {
    const getStatusColor = () => {
      if (result.success) return '#00ff44';
      if (result.error) return '#ff3366';
      return '#ffaa00';
    };

    const getCardBrand = (type) => {
      const brands = {
        'visa': '💳 VISA',
        'mastercard': '💳 MASTERCARD',
        'amex': '💳 AMEX',
        'discover': '💳 DISCOVER',
        'diners': '💳 DINERS',
        'jcb': '💳 JCB'
      };
      return brands[type?.toLowerCase()] || '💳';
    };

    const getLevelBadge = (level) => {
      const badges = {
        'BLACK': { bg: '#000', text: '#fff' },
        'INFINITE': { bg: '#1a1a1a', text: '#00ff44' },
        'PLATINUM': { bg: '#666', text: '#fff' },
        'GOLD': { bg: '#ffd700', text: '#000' },
        'CLASSIC': { bg: '#4a4a4a', text: '#fff' }
      };
      
      const style = badges[level?.toUpperCase()] || badges.CLASSIC;
      
      return `
        <span style="
          background: ${style.bg};
          color: ${style.text};
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          margin-left: 8px;
        ">
          ${level || 'CLASSIC'}
        </span>
      `;
    };

    return `
      <div class="card-result" style="
        background: #111;
        border: 2px solid ${getStatusColor()};
        border-radius: 12px;
        padding: 20px;
        font-family: 'Courier New', monospace;
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          background: ${getStatusColor()};
          color: #000;
          padding: 5px 15px;
          border-bottom-left-radius: 8px;
          font-weight: bold;
          font-size: 14px;
        ">
          ${result.success ? 'APPROVED ✓' : 'DECLINED ✗'}
        </div>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        ">
          <div>
            <span style="color: #666; font-size: 12px;">CARD NUMBER</span><br>
            <span style="color: #fff; font-size: 18px; font-weight: bold;">
              ${getCardBrand(result.type)} ${result.card || result.cc}
            </span>
          </div>
          
          <div>
            <span style="color: #666; font-size: 12px;">BANK INFO</span><br>
            <span style="color: #fff;">
              ${result.bank || 'N/A'} ${getLevelBadge(result.level)}
            </span>
          </div>
          
          <div>
            <span style="color: #666; font-size: 12px;">COUNTRY</span><br>
            <span style="color: #fff;">
              ${result.country || 'N/A'} ${result.flag ? `🏳️‍ ${result.flag}` : ''}
            </span>
          </div>
        </div>

        <div style="
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #333;
          color: ${getStatusColor()};
          font-weight: bold;
          font-size: 16px;
          text-align: center;
        ">
          ${result.retorno || result.message || 'Transaction processed'}
        </div>
      </div>
    `;
  };

  useEffect(() => {
    function checkVersion() {
      if (!window.localStorage.getItem(versionData.versionCode)) {
        alerts.fire({
          icon: 'info',
          title: 'New version: ' + versionData.versionCode + '!',
          html: versionData.updates,
        });
        window.localStorage.setItem(versionData.versionCode, 'true');
      }
    }
    checkVersion();
  }, []);

  async function handleBuyCard(cardId) {
    const res = await axios.post(
      '/api/cards',
      { id: cardId },
      {
        headers: { token: window.localStorage.getItem('token') },
      }
    );

    if (res.data.error) {
      return alerts
        .fire({
          icon: 'warning',
          showCancelButton: true,
          html: res.data.error,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Charge',
        })
        .then((res) => {
          if (res.isConfirmed) return router.push('/dashboard/wallet');
        });
    }
    getData();
    getUser();

    alerts.fire({
      icon: 'success',
      html: `<b>PURCHASED CARD: </b><br/> <b>NUMBER:</b> ${res.data.card.number}<br/><b>DETAILS:</b> ${res.data.card.data}<br/><b>PIN:</b> ${res.data.card.pin}<br/>${res.data.card.bin}<br/>PRICE: $${res.data.card.price}`,
    });
  }

  return (
    <>
      <Head>
        <title>SECCX.PRO | Dashboard</title>
      </Head>

      {user && (
        <div className="root" style={{ width: '80%' }}>
          <Header user={user} />
          {!isChecking ? (
            <>
              <div className="checker">
                <h2>
                  <span>
                    <FontAwesomeIcon icon={faCreditCard} /> CC CHECKER <br />
                    <small style={{ fontSize: '14px', opacity: 0.9, fontWeight: 'lighter' }}>
                      {checkerType === 'premium' ? 'Premium Gateway: Charged Cards' : 'Adyen Gateway: Fullz & Gens'}
                    </small>
                  </span>
                  <div>
                    <small style={{
                      fontSize: '12px',
                      letterSpacing: 1,
                      background: '#f5f5f5',
                      color: 'black',
                      marginLeft: '10px',
                      padding: '1px 2px',
                      borderRadius: '5px',
                    }}>
                      {checkerType === 'premium' ? 
                        '$1.00/live | $0.10/die' : 
                        '$0.50/live'
                      }
                    </small>
                  </div>
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <select 
                    value={checkerType}
                    onChange={(e) => setCheckerType(e.target.value)}
                    style={{
                      padding: '8px',
                      background: '#111',
                      color: '#fff',
                      border: '1px solid #222',
                      borderRadius: '4px',
                      width: '200px'
                    }}
                  >
                    <option value="adyen">Adyen Checker ($0.50/live)</option>
                    <option value="premium">Premium Checker ($1.00/live | $0.10/die)</option>
                  </select>
                </div>

                {checkerType === 'premium' && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '10px',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#ff4444'
                  }}>
                    ⚠️ Warning: Account will be blocked after 20 consecutive dies in 24h
                  </div>
                )}

                <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column' }}>
                  <textarea
                    onChange={(e) => setList(e.target.value)}
                    placeholder="Format: 4532117190458043|11|2027|475"
                    cols="30"
                    rows="10"
                  ></textarea>
                  <button style={{ marginTop: '20px' }}>
                    <FontAwesomeIcon icon={faRocket} /> Check
                  </button>
                </form>
              </div>
              <br />
            </>
          ) : (
            <>
              <div className="checker-status">
                <h2>Running check...</h2>

                <span>
                  Lives: <b style={{ color: 'greenyellow' }}>{lives.length}</b>{' '}
                  / Dies: <b style={{ color: 'tomato' }}>{dies.length}</b> /
                  Checkeds:{' '}
                  <b style={{ color: 'deepskyblue' }}>
                    {lives.length + dies.length}
                  </b>{' '}
                  / Live Rate:{' '}
                  {isNaN((lives.length / (lives.length + dies.length)) * 100)
                    ? '0'
                    : (
                        parseFloat(
                          lives.length / (lives.length + dies.length)
                        ) * 100
                      ).toFixed(0)}
                  %
                </span>

                <button onClick={handleStop}>
                  <FontAwesomeIcon icon={faTrash} /> Kill Proccess
                </button>

                <div className="lives" style={{ marginTop: '20px' }}>
                  <span style={{ color: '#f5f5f5', fontSize: '13px' }}>
                    LIVES
                  </span>
                  {lives.length < 1 && (
                    <small style={{ opacity: 0.5 }}>Nothing yet...</small>
                  )}
                  {lives.map((item) => (
                    <div key={item.key}>
                      {item.return} / {item.cc} / {item.bin} / CHECKED BY SECCX.PRO
                    </div>
                  ))}
                </div>

                <div className="dies" style={{ marginTop: '20px' }}>
                  <span style={{ color: '#f5f5f5', fontSize: '13px' }}>
                    DIES
                  </span>
                  <br />
                  {dies.length < 1 && (
                    <small style={{ opacity: 0.5 }}>Nothing yet...</small>
                  )}
                  {dies.map((item) => (
                    <div key={item.key} style={{ border: '1px solid #222 !important' }}>
                      {item.return} / {item.cc} / {item.bin} / CHECKED BY SECCX.PRO
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <Footer />
        </div>
      )}
    </>
  );
}
