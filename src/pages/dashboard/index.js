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

// Configurações dos checkers
const CHECKER_CONFIG = {
  adyen: {
    name: 'Adyen Gateway',
    description: 'For Fullz & Gens',
    liveCost: 0.50,
    dieCost: 0,
    maxDies: 40,
    apiUrl: process.env.API_1_URL
  },
  premium: {
    name: 'Premium Gateway',
    description: 'Charged Cards',
    liveCost: 1.00,
    dieCost: 0.10,
    maxDies: 20,
    apiUrl: process.env.API_2_URL
  }
};

// Função para obter informações do BIN
const getBinInfo = async (bin) => {
  try {
    const res = await axios.get(`https://lookup.binlist.net/${bin}`);
    return {
      bank: res.data.bank?.name || 'Unknown Bank',
      type: res.data.type?.toUpperCase() || 'Unknown Type',
      brand: res.data.scheme?.toUpperCase() || 'Unknown Brand',
      country: res.data.country?.name || 'Unknown Country',
      level: res.data.brand?.toLowerCase().includes('platinum') ? 'PLATINUM' : 
             res.data.brand?.toLowerCase().includes('business') ? 'BUSINESS' : 
             res.data.brand?.toLowerCase().includes('corporate') ? 'CORPORATE' : 'CLASSIC'
    };
  } catch (error) {
    const firstDigit = bin?.charAt(0);
    let basicInfo = {
      bank: 'Unknown Bank',
      type: 'CREDIT',
      brand: 'Unknown Brand',
      country: 'Unknown Country',
      level: 'CLASSIC'
    };

    if (firstDigit === '4') basicInfo.brand = 'VISA';
    else if (firstDigit === '5') basicInfo.brand = 'MASTERCARD';
    else if (firstDigit === '3') basicInfo.brand = ['4','7'].includes(bin?.charAt(1)) ? 'AMEX' : 'JCB';
    else if (firstDigit === '6') basicInfo.brand = 'DISCOVER';

    return basicInfo;
  }
};

// Função para formatar o cartão
const formatCard = (cc) => {
  const [number, month, year, cvv] = cc.split('|');
  return {
    number: number?.trim(),
    month: month?.trim(),
    year: year?.trim(),
    cvv: cvv?.trim(),
    bin: number?.slice(0, 6)
  };
};

// Função para processar o retorno do checker Adyen
const processAdyenResponse = (response, binInfo) => {
  const result = {
    card: response.cc,
    binInfo,
    message: '',
    success: false,
    details: {
      number: response.cc?.split('|')[0] || '',
      brand: binInfo.brand,
      type: binInfo.type,
      bank: binInfo.bank,
      country: binInfo.country,
      level: binInfo.level
    }
  };

  if (response.success && response.retorno?.includes('Pagamento Aprovado')) {
    result.success = true;
    result.message = 'Pagamento Aprovado! [00]';
  } else if (response.error) {
    result.success = false;
    result.message = response.retorno || 'Cartão Invalido!';
  } else {
    result.success = false;
    result.message = 'Sua Transação Foi Negada!';
  }

  return result;
};

// Função para processar o retorno do checker Premium
const processPremiumResponse = (response, binInfo) => {
  const result = {
    card: response.cc,
    binInfo,
    message: '',
    success: false,
    details: {
      number: response.cc?.split('|')[0] || '',
      brand: binInfo.brand,
      type: binInfo.type,
      bank: binInfo.bank,
      country: binInfo.country,
      level: binInfo.level
    }
  };

  if (response.success && response.retorno?.includes('Pagamento Aprovado')) {
    result.success = true;
    result.message = 'Pagamento Aprovado!';
  } else if (response.error) {
    result.success = false;
    switch (response.retorno) {
      case 'CARD_EXPIRED':
        result.message = 'Cartão Expirado!';
        break;
      case 'CARD_NOT_SUPPORTED':
        result.message = 'Cartão Não Suportado!';
        break;
      default:
        result.message = 'Cartão Invalido!';
    }
  } else {
    result.success = false;
    result.message = 'Sua Transação Foi Negada!';
  }

  return result;
};

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
  const [consecutiveDies, setConsecutiveDies] = useState(0);
  const [checkerType, setCheckerType] = useState('adyen');

  const getUser = async () => {
    try {
      const token = window.localStorage.getItem('token');
      const res = await axios.get('/api/sessions', {
        headers: { token }
      });

      if (res.data.error) {
        router.push('/');
        return;
      }

      setUser(res.data.user);
    } catch (error) {
      console.error('Error getting user:', error);
      router.push('/');
    }
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
    await getUser();

    const minBalance = checkerType === 'premium' ? 1.0 : 0.5;
    if (user.balance < minBalance) {
      return alerts.fire({
        icon: 'warning',
        html: `Insufficient funds to check cards. <b>Add funds now!</b>`,
      }).then(() => router.push('/dashboard/wallet'));
    }

    setChecking(true);
    const listFormated = String(list).split('\n').filter(n => n);

    listFormated.forEach((cc, index) => {
      setTimeout(async () => {
        try {
          const check = await axios.post('/api/checks', {
            cc,
            checker: checkerType,
            gateway_server: 'us-' + Math.floor(Math.random() * (20 - 1 + 1) + 1),
          }, {
            headers: { token: window.localStorage.getItem('token') }
          });

          const data = check.data;

          // Processar resposta baseado no tipo de checker
          if (checkerType === 'premium') {
            if (data.success && data.retorno.includes('Pagamento Aprovado')) {
              setLives(old => [{
                ...data,
                key: Date.now() + index,
                checkedAt: new Date().toISOString()
              }, ...old]);
            } else {
              setDies(old => [{
                ...data,
                key: Date.now() + index,
                checkedAt: new Date().toISOString()
              }, ...old]);
            }
          } else {
            // Lógica original do Adyen
            if (data.success) {
              setLives(old => [{
                ...data,
                key: Date.now() + index,
                checkedAt: new Date().toISOString()
              }, ...old]);
            } else {
              setDies(old => [{
                ...data,
                key: Date.now() + index,
                checkedAt: new Date().toISOString()
              }, ...old]);
            }
          }

          if (listFormated.length - 1 === index) {
            setChecking(false);
            alerts.fire({
              icon: 'success',
              html: `Check Complete!<br/>
                    Total: ${listFormated.length}<br/>
                    Lives: ${lives.length} | Dies: ${dies.length}`
            });
          }

        } catch (error) {
          console.error('Check error:', error);
          setDies(old => [{
            success: false,
            message: 'Check Error',
            cc,
            key: Date.now() + index,
            checkedAt: new Date().toISOString()
          }, ...old]);
        }
      }, 3000 * index);
    });
  }

  // Função para o checker Premium
  async function handlePremiumCheck(e) {
    e.preventDefault();
    await getUser();

    if (user.balance < CHECKER_CONFIG.premium.liveCost) {
      return alerts.fire({
        icon: 'warning',
        title: 'Insufficient Premium Funds',
        html: `You need at least $${CHECKER_CONFIG.premium.liveCost} for premium checks.<br/><b>Add funds now!</b>`,
      }).then(() => router.push('/dashboard/wallet'));
    }

    setChecking(true);
    setLives([]);
    setDies([]);
    const listFormated = String(premiumList).split('\n').filter(n => n);

    for (let index = 0; index < listFormated.length; index++) {
      const cc = listFormated[index];
      setTimeout(async () => {
        try {
          const cardData = formatCard(cc);
          const binInfo = await getBinInfo(cardData.bin);

          const check = await axios.get(CHECKER_CONFIG.premium.apiUrl + cc);

          const result = {
            card: cc,
            binInfo,
            message: check.data.retorno,
            success: check.data.success && check.data.retorno.includes('Pagamento Aprovado'),
            details: {
              number: cardData.number,
              brand: binInfo.brand,
              type: binInfo.type,
              bank: binInfo.bank,
              country: binInfo.country,
              level: binInfo.level
            }
          };

          if (result.success) {
            setConsecutiveDies(0);
            setLives(old => [result, ...old]);
          } else {
            setConsecutiveDies(prev => {
              const newCount = prev + 1;
              if (newCount >= CHECKER_CONFIG.premium.maxDies) {
                alerts.fire({
                  icon: 'error',
                  title: 'Account Restricted',
                  text: 'Too many consecutive failed checks. Your account has been restricted for 24 hours.'
                });
              }
              return newCount;
            });
            setDies(old => [result, ...old]);
          }

          if (index === listFormated.length - 1) {
            alerts.fire({
              icon: 'success',
              html: `Premium Check Complete!<br/>
                    Total: ${listFormated.length}<br/>
                    Lives: ${lives.length} | Dies: ${dies.length}`
            });
          }
        } catch (error) {
          console.error(error);
          const binInfo = await getBinInfo(cc.split('|')[0]?.slice(0,6));
          setDies(old => [{
            card: cc,
            success: false,
            message: 'Premium Check Error',
            binInfo
          }, ...old]);
        }
      }, 3000 * index);
    }
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

  // Função para limpar resultados (opcional para o usuário)
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
      }
    });
  };

  return (
    <>
      <Head>
        <title>SECCX.PRO | Premium Checker</title>
      </Head>

      {user ? (
        <div className="root" style={{ width: '80%', margin: '0 auto' }}>
          <Header user={user} />

          <div style={{
            background: 'linear-gradient(145deg, #111 0%, #0a0a0a 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '1px solid #222'
          }}>
            {!isChecking ? (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '24px',
                      color: '#00ff44',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FontAwesomeIcon icon={faCreditCard} />
                      {checkerType === 'premium' ? 'Premium' : 'Adyen'} Checker
                    </h2>
                    <p style={{ color: '#666', marginTop: '5px' }}>
                      {checkerType === 'premium' ? 
                        'Premium Gateway ($1.00/live | $0.10/die)' : 
                        'Adyen Gateway ($0.50/live)'}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => setCheckerType('adyen')}
                      style={{
                        background: checkerType === 'adyen' ? '#00ff44' : '#111',
                        color: checkerType === 'adyen' ? '#000' : '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Adyen
                    </button>
                    <button
                      onClick={() => setCheckerType('premium')}
                      style={{
                        background: checkerType === 'premium' ? '#00ff44' : '#111',
                        color: checkerType === 'premium' ? '#000' : '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Premium
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCheck}>
                  <textarea
                    onChange={(e) => setList(e.target.value)}
                    placeholder="Format: 4532117190458043|11|2027|475"
                    style={{
                      width: '100%',
                      height: '200px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '12px',
                      padding: '20px',
                      color: '#fff',
                      fontSize: '14px',
                      marginBottom: '20px'
                    }}
                  />

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(45deg, #00ff44, #00cc44)',
                      color: '#000',
                      border: 'none',
                      padding: '15px',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faRocket} /> Start Check
                  </button>
                </form>
              </>
            ) : (
              <div className="checker-status">
                <h2>Running check...</h2>
                <div style={{
                  background: '#0a0a0a',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  Lives: <span style={{ color: '#00ff44' }}>{lives.length}</span> |
                  Dies: <span style={{ color: '#ff4444' }}>{dies.length}</span> |
                  Total: <span style={{ color: '#00aaff' }}>{lives.length + dies.length}</span>
                </div>

                <div className="results" style={{ display: 'grid', gap: '15px' }}>
                  {[...lives, ...dies].map((result) => (
                    <div key={result.key} style={{
                      background: '#0a0a0a',
                      border: `1px solid ${result.success ? '#00ff44' : '#ff4444'}`,
                      borderRadius: '10px',
                      padding: '15px'
                    }}>
                      <div style={{ color: result.success ? '#00ff44' : '#ff4444' }}>
                        {result.cc}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {result.message || result.return}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleStop} style={{
                  background: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  marginTop: '20px',
                  cursor: 'pointer'
                }}>
                  <FontAwesomeIcon icon={faTrash} /> Stop Check
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ReactLoading type="spinningBubbles" color="#00ff44" />
      )}
    </>
  );
}
