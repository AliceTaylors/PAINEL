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

  // Função para o checker Adyen
  async function handleCheck(e) {
    e.preventDefault();
    await getUser();

    if (user.balance < CHECKER_CONFIG.adyen.liveCost) {
      return alerts.fire({
        icon: 'warning',
        title: 'Insufficient Funds',
        html: `You need at least $${CHECKER_CONFIG.adyen.liveCost} to check cards.<br/><b>Add funds now!</b>`,
      }).then(() => router.push('/dashboard/wallet'));
    }

    setChecking(true);
    setLives([]);
    setDies([]);
    const listFormated = String(list).split('\n').filter(n => n);

    for (let index = 0; index < listFormated.length; index++) {
      const cc = listFormated[index];
      setTimeout(async () => {
        try {
          const cardData = formatCard(cc);
          const binInfo = await getBinInfo(cardData.bin);

          const check = await axios.get(CHECKER_CONFIG.adyen.apiUrl + cc);

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
            setLives(old => [result, ...old]);
          } else {
            setDies(old => [result, ...old]);
          }

          if (index === listFormated.length - 1) {
            alerts.fire({
              icon: 'success',
              html: `Check Complete!<br/>
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
            message: 'Adyen Check Error',
            binInfo
          }, ...old]);
        }
      }, 3000 * index);
    }
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

  return (
    <>
      <Head>
        <title>SECCX.PRO | Premium Checker</title>
      </Head>

      {user ? (
        <div className="root" style={{ width: '80%' }}>
          <Header user={user} />

          <div style={{
            background: 'linear-gradient(145deg, #111 0%, #0a0a0a 100%)',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid #222',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '2em',
                  color: '#00ff00',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  {checkerType === 'premium' ? 'Premium' : 'Standard'} Checker
                </h1>
                <p style={{ color: '#666', marginTop: '5px' }}>
                  {CHECKER_CONFIG[checkerType].description}
                </p>
              </div>

              <div style={{
                background: '#0a0a0a',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid #222'
              }}>
                <div style={{ color: '#00ff00', fontWeight: 'bold' }}>
                  ${CHECKER_CONFIG[checkerType].liveCost}/live
                </div>
                {checkerType === 'premium' && (
                  <div style={{ color: '#666', fontSize: '0.9em' }}>
                    ${CHECKER_CONFIG[checkerType].dieCost}/die
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {['adyen', 'premium'].map(type => (
                <button
                  key={type}
                  onClick={() => setCheckerType(type)}
                  style={{
                    background: checkerType === type ? 
                      'linear-gradient(45deg, #00ff00, #00cc00)' : '#111',
                    color: checkerType === type ? '#000' : '#fff',
                    border: `1px solid ${checkerType === type ? '#00ff00' : '#222'}`,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {CHECKER_CONFIG[type].name}
                </button>
              ))}
            </div>

            {!isChecking ? (
              <form onSubmit={handleCheck}>
                <textarea
                  onChange={(e) => setList(e.target.value)}
                  placeholder="Format: 4532117190458043|11|2027|475"
                  style={{
                    width: '100%',
                    height: '200px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '10px',
                    padding: '15px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '20px'
                  }}
                />

                {checkerType === 'premium' && (
                  <div style={{
                    background: 'rgba(255,0,0,0.1)',
                    border: '1px solid rgba(255,0,0,0.2)',
                    color: '#ff4444',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '20px'
                  }}>
                    ⚠️ Account will be blocked after {CHECKER_CONFIG.premium.maxDies} consecutive dies
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(45deg, #00ff00, #00cc00)',
                    color: '#000',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <FontAwesomeIcon icon={faRocket} />
                  Start Checking
                </button>
              </form>
            ) : (
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
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {[...lives, ...dies].map((card, index) => (
                    <div key={index} style={{
                      padding: '15px',
                      background: card.success ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: card.success ? '#00ff00' : '#ff4444' }}>
                          {card.card}
                        </span>
                        <span style={{ color: '#888' }}>
                          {card.details.brand} | {card.details.type}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{card.details.bank}</span>
                        <span>{card.details.country}</span>
                        <span>{card.details.level}</span>
                      </div>
                      <div style={{
                        marginTop: '5px',
                        color: card.success ? '#00ff00' : '#ff4444'
                      }}>
                        {card.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
