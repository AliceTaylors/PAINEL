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
  faServer,
  faBarcode,
  faWallet,
  faPlus,
  faSpinner,
  faPlay
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

export default function Dashboard() {
  const { t, lang } = useTranslation('dashboard');
  const [cards, setCards] = useState([]);
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const [isChecking, setChecking] = useState(false);
  const [list, setList] = useState('');
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
    
    if (!list || list.trim() === '') {
      return alerts.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter cards to check'
      });
    }

    const minBalance = checkerType === 'premium' ? 1.0 : 0.5;
    if (user.balance < minBalance) {
      return alerts.fire({
        icon: 'warning',
        html: `You need at least $${minBalance} to check cards.<br/><b>Add funds now!</b>`,
      }).then(() => router.push('/dashboard/wallet'));
    }

    setChecking(true);
    const listFormated = String(list).split('\n').filter(n => n);
    let processedCount = 0;

    for (let i = 0; i < listFormated.length; i++) {
      const cc = listFormated[i];
      
      try {
        const check = await axios.post('/api/checks', {
          cc,
          checker: checkerType,
          gateway_server: `us-${Math.floor(Math.random() * 20) + 1}`
        }, {
          headers: { token: window.localStorage.getItem('token') }
        });

        const data = check.data;
        processedCount++;

        if (data.success && (checkerType === 'adyen' || data.retorno?.includes('Pagamento Aprovado'))) {
          setLives(old => [{
            ...data,
            cc,
            key: `${Date.now()}-${i}`,
            checkedAt: new Date().toISOString()
          }, ...old]);
        } else {
          setDies(old => [{
            ...data,
            cc,
            key: `${Date.now()}-${i}`,
            checkedAt: new Date().toISOString()
          }, ...old]);
        }

        // Atualizar user após cada check
        await getUser();

        // Aguardar 3 segundos antes do próximo check
        if (i < listFormated.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error('Check error:', error);
        processedCount++;
        setDies(old => [{
          success: false,
          message: error.response?.data?.message || 'Check Error',
          cc,
          key: `${Date.now()}-${i}`,
          checkedAt: new Date().toISOString()
        }, ...old]);
      }
    }

    setChecking(false);
    alerts.fire({
      icon: 'success',
      title: 'Check Complete!',
      html: `
        <div style="text-align: left">
          <p>Total: ${processedCount}</p>
          <p style="color: #00ff44">Lives: ${lives.length}</p>
          <p style="color: #ff4444">Dies: ${dies.length}</p>
        </div>
      `
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
    <div className="dashboard">
      <Head>
        <title>SECCX.PRO | Dashboard</title>
      </Head>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo">
            <FontAwesomeIcon icon={faBarcode} />
            <span className="gradient-text">SECCX.PRO</span>
          </div>
          
          <div className="user-info">
            <div className="balance">
              <FontAwesomeIcon icon={faWallet} />
              <span>${user?.balance.toFixed(2)}</span>
            </div>
            <button onClick={() => router.push('/dashboard/wallet')} className="add-funds">
              <FontAwesomeIcon icon={faPlus} /> Add Funds
            </button>
          </div>
        </div>

        <div className="checker-container">
          <div className="checker-type">
            <button 
              className={checkerType === 'adyen' ? 'active' : ''}
              onClick={() => setCheckerType('adyen')}
            >
              <FontAwesomeIcon icon={faCreditCard} /> Adyen
              <span className="price">$0.50/live</span>
            </button>
            <button 
              className={checkerType === 'premium' ? 'active' : ''}
              onClick={() => setCheckerType('premium')}
            >
              <FontAwesomeIcon icon={faGem} /> Premium
              <span className="price">$1.00/live</span>
            </button>
          </div>

          <div className="checker-form">
            <textarea
              placeholder="Format: 4532117190458043|11|2027|475"
              onChange={(e) => setList(e.target.value)}
              disabled={isChecking}
            />
            
            <button 
              onClick={handleCheck}
              disabled={isChecking}
              className="check-button"
            >
              {isChecking ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Checking...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlay} /> Start Check
                </>
              )}
            </button>
          </div>

          <div className="results-container">
            <div className="results-header">
              <div className="stats">
                <div className="stat">
                  <span className="label">Lives</span>
                  <span className="value live">{lives.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Dies</span>
                  <span className="value die">{dies.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Total</span>
                  <span className="value">{lives.length + dies.length}</span>
                </div>
              </div>
            </div>

            <div className="results-grid">
              {lives.map((result) => (
                <div key={result.key} className="result-card live">
                  <div className="card-number">{result.cc}</div>
                  <div className="card-info">
                    <div className="bin-info">
                      <span>{result.binInfo?.brand}</span>
                      <span>{result.binInfo?.type}</span>
                      <span>{result.binInfo?.level}</span>
                    </div>
                    <div className="bank-info">
                      <span>{result.binInfo?.bank}</span>
                      <span>{result.binInfo?.country}</span>
                    </div>
                  </div>
                  <div className="result-message">{result.message}</div>
                </div>
              ))}

              {dies.map((result) => (
                <div key={result.key} className="result-card die">
                  <div className="card-number">{result.cc}</div>
                  <div className="card-info">
                    <div className="bin-info">
                      <span>{result.binInfo?.brand}</span>
                      <span>{result.binInfo?.type}</span>
                      <span>{result.binInfo?.level}</span>
                    </div>
                    <div className="bank-info">
                      <span>{result.binInfo?.bank}</span>
                      <span>{result.binInfo?.country}</span>
                    </div>
                  </div>
                  <div className="result-message">{result.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: clamp(10px, 2vw, 20px);
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: clamp(15px, 3vw, 25px);
          background: rgba(0,255,68,0.03);
          border-radius: 15px;
          border: 1px solid rgba(0,255,68,0.1);
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .gradient-text {
          font-size: clamp(1.5rem, 3vw, 2rem);
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
          margin-left: 10px;
        }

        .user-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .balance {
          background: rgba(0,255,68,0.1);
          padding: 10px 20px;
          border-radius: 10px;
          color: #00ff44;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-funds {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .add-funds:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,255,68,0.2);
        }

        .checker-container {
          background: rgba(0,255,68,0.03);
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          padding: clamp(15px, 3vw, 30px);
          backdrop-filter: blur(10px);
        }

        .checker-type {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .checker-type button {
          flex: 1;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(0,255,68,0.1);
          background: rgba(17,17,17,0.7);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .checker-type button.active {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
        }

        .price {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        textarea {
          width: 100%;
          min-height: 150px;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #222;
          background: rgba(17,17,17,0.7);
          color: #fff;
          font-family: monospace;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        textarea:focus {
          outline: none;
          border-color: #00ff44;
          box-shadow: 0 0 20px rgba(0,255,68,0.1);
        }

        .check-button {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .check-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .results-container {
          margin-top: 30px;
        }

        .results-header {
          margin-bottom: 20px;
        }

        .stats {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .stat .label {
          color: #666;
          font-size: 0.9rem;
        }

        .stat .value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .value.live { color: #00ff44; }
        .value.die { color: #ff4444; }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .result-card {
          background: rgba(17,17,17,0.7);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid rgba(0,255,68,0.1);
        }

        .result-card.live {
          border-color: #00ff44;
        }

        .result-card.die {
          border-color: #ff4444;
        }

        .card-number {
          font-family: monospace;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.9rem;
          color: #666;
        }

        .bin-info, .bank-info {
          display: flex;
          gap: 10px;
        }

        .result-message {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 0.9rem;
          color: #888;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .user-info {
            flex-direction: column;
          }

          .checker-type {
            flex-direction: column;
          }

          .stats {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .bin-info, .bank-info {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}
