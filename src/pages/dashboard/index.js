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
  faShieldHalved,
  faGem,
  faChartLine,
  faBolt,
  faServer
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import versionData from '../../version.json';
import checkerSettings from '../../checkerSettings';
import Header from '../../components/Header';
import AccountDetails from '../../components/AccountDetails';
import Footer from '../../components/Footer';
import useTranslation from 'next-translate/useTranslation';

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
  const [premiumList, setPremiumList] = useState(null);

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
        console.log(listFormated.length);

        if (listFormated.length - 1 == lives + dies) {
          alerts.fire({
            icon: 'success',
            html: 'Ready!<br/>' + listFormated.length + ' card(s) checked!',
          });
        }
      }, 3000 * index);
    });
  }

  async function handlePremiumCheck(e) {
    e.preventDefault();

    getUser();

    if (user.balance < 0.1) {
      return alerts
        .fire({
          icon: 'warning',
          html: 'Insufficient funds to check cards. <b>Add funds now</b>!',
        })
        .then(() => {
          router.push('/dashboard/wallet');
        });
    }

    setChecking(true);

    const listFormated = String(premiumList)
      .split('\n')
      .filter((n) => n);

    if (!user) {
      router.push('/');
    }

    listFormated.forEach(async (cc, index) => {
      setTimeout(async () => {
        if (user.balance < 0.1) {
          return alerts
            .fire({
              icon: 'warning',
              html: 'Insufficient funds to check cards. <b>Recharge now</b>!',
            })
            .then(() => {
              router.push('/dashboard/wallet');
            });
        }

        const check = await axios.post(
          '/api/premium-checks',
          {
            cc,
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
        <title>SECCX.PRO | Premium Dashboard</title>
      </Head>

      {user ? (
        <div className="root" style={{ width: '80%' }}>
          <Header user={user} />

          <div className="dashboard-hero" style={{
            background: 'linear-gradient(135deg, #000 0%, #111 100%)',
            padding: '40px',
            borderRadius: '20px',
            marginBottom: '30px',
            border: '1px solid #222',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(0,255,0,0.1) 0%, transparent 70%)',
              filter: 'blur(60px)',
              transform: 'translate(30%, -30%)'
            }} />

            <h1 style={{
              fontSize: '2.8em',
              background: 'linear-gradient(to right, #fff, #00ff00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <FontAwesomeIcon icon={faRocket} />
              Premium Checker
            </h1>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginTop: '30px'
            }}>
              {[
                { icon: faBolt, title: 'High Speed', value: '0.8s/check' },
                { icon: faShieldHalved, title: 'Success Rate', value: '95%+' },
                { icon: faServer, title: 'Server Status', value: 'Online' },
                { icon: faChartLine, title: 'Daily Checks', value: '10k+' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(0,255,0,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(0,255,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(0,255,0,0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FontAwesomeIcon icon={stat.icon} style={{ color: '#00ff00', fontSize: '24px' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>{stat.title}</h3>
                    <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 'bold' }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AccountDetails user={user} />

          <div className="checker-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginTop: '30px'
          }}>
            {/* Checker Standard */}
            <div className="checker-card" style={{
              background: 'linear-gradient(135deg, #111 0%, #000 100%)',
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid #222',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#00ff00',
                color: '#000',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ${checkerSettings.checkLiveCost * -1}/live
              </div>

              <h2 style={{
                color: '#00ff00',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <FontAwesomeIcon icon={faCreditCard} />
                Standard Checker
                <small style={{
                  fontSize: '14px',
                  opacity: 0.7,
                  fontWeight: 'normal',
                  marginLeft: '10px'
                }}>
                  Adyen Gateway
                </small>
              </h2>

              <form onSubmit={handleCheck} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <textarea
                  onChange={(e) => setList(e.target.value)}
                  placeholder="Format: 5054105415045405|00|2025|000"
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '10px',
                    padding: '15px',
                    color: '#fff',
                    height: '150px',
                    resize: 'none',
                    fontSize: '14px'
                  }}
                />
                <button style={{
                  background: 'linear-gradient(to right, #00ff00, #00cc00)',
                  color: '#000',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}>
                  <FontAwesomeIcon icon={faRocket} />
                  Start Checking
                </button>
              </form>

              {isChecking && (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  background: '#0a0a0a',
                  borderRadius: '10px',
                  border: '1px solid #222'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <span style={{ color: '#00ff00' }}>Lives: {lives.length}</span>
                    <span style={{ color: '#ff4444' }}>Dies: {dies.length}</span>
                  </div>
                  {/* Resto do código de checking... */}
                </div>
              )}
            </div>

            {/* Premium Checker */}
            <div className="checker-card premium" style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid #333',
              position: 'relative'
            }}>
              {/* Similar structure to standard checker but with premium styling */}
            </div>
          </div>

          <Footer />
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <ReactLoading type="spinningBubbles" color="#00ff00" />
        </div>
      )}

      <style jsx>{`
        .checker-card {
          transition: all 0.3s ease;
        }
        .checker-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,255,0,0.1);
        }
        textarea:focus {
          outline: none;
          border-color: #00ff00;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,255,0,0.2);
        }
      `}</style>
    </>
  );
}
