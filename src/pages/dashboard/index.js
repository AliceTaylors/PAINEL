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

  async function handleCheck(e) {
    e.preventDefault();
    getUser();

    const minBalance = checkerType === 'adyen' ? 0.50 : 1.00;
    if (user.balance < minBalance) {
      return alerts.fire({
        icon: 'warning',
        html: `Insufficient funds to check cards. Minimum balance required: $${minBalance}`,
      }).then(() => {
        router.push('/dashboard/wallet');
      });
    }

    setChecking(true);

    const listFormated = String(list)
      .split('\n')
      .filter((n) => n);

    listFormated.forEach((cc, index) => {
      setTimeout(() => {
        const checkCard = async () => {
          try {
            const [number, month, year, cvv] = cc.split('|');
            if (!number || !month || !year || !cvv) {
              setDies((old) => [{
                return: "#ERROR",
                cc: cc,
                bin: "Invalid card format",
                key: crypto.randomUUID()
              }, ...old]);
              return;
            }

            // Obter informações do BIN primeiro
            const binInfo = await getBinInfo(cc);

            // Fazer requisição ao checker apropriado
            const API_URL = checkerType === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;
            
            try {
              const checkResult = await axios.get(`${API_URL}/${cc}`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              });

              if (checkerType === 'adyen') {
                // Processar resposta do Adyen
                if (checkResult.data.live === true) {
                  setLives((old) => [{
                    return: "#LIVE",
                    cc: cc,
                    bin: binInfo,
                    key: crypto.randomUUID()
                  }, ...old]);

                  await axios.post('/api/update-balance', {
                    amount: -0.50,
                    type: 'ADYEN LIVE',
                    data: cc
                  }, {
                    headers: { token: window.localStorage.getItem('token') }
                  });
                } else {
                  setDies((old) => [{
                    return: "#DIE",
                    cc: cc,
                    bin: binInfo,
                    key: crypto.randomUUID()
                  }, ...old]);
                }
              } else {
                // Processar resposta do Premium
                if (checkResult.data.success && checkResult.data.retorno.includes('Pagamento Aprovado')) {
                  setLives((old) => [{
                    return: "#LIVE",
                    cc: cc,
                    bin: binInfo,
                    key: crypto.randomUUID()
                  }, ...old]);

                  await axios.post('/api/update-balance', {
                    amount: -1.00,
                    type: 'PREMIUM LIVE',
                    data: cc
                  }, {
                    headers: { token: window.localStorage.getItem('token') }
                  });
                } else if (checkResult.data.error) {
                  setDies((old) => [{
                    return: "#ERROR",
                    cc: cc,
                    bin: checkResult.data.retorno || "Check Error",
                    key: crypto.randomUUID()
                  }, ...old]);
                } else {
                  setDies((old) => [{
                    return: "#DIE",
                    cc: cc,
                    bin: binInfo,
                    key: crypto.randomUUID()
                  }, ...old]);
                }
              }

              await getUser();

              // Verificar se é o último cartão
              if (listFormated.length === index + 1) {
                setChecking(false);
                alerts.fire({
                  icon: 'success',
                  html: 'Ready!<br/>' + listFormated.length + ' card(s) checked!',
                });
              }

            } catch (error) {
              console.error('Check error:', error);
              setDies((old) => [{
                return: "#ERROR",
                cc: cc,
                bin: binInfo || "API Connection Error",
                key: crypto.randomUUID()
              }, ...old]);
            }
          } catch (error) {
            console.error('General error:', error);
            setDies((old) => [{
              return: "#ERROR",
              cc: cc,
              bin: binInfo || "System Error",
              key: crypto.randomUUID()
            }, ...old]);
          }
        };

        checkCard();
      }, 3000 * index);
    });
  }

  async function getBinInfo(cc) {
    try {
      const bin = cc.split('|')[0].slice(0, 6);
      const binUrl = `https://lookup.binlist.net/${bin}`;
      const response = await axios.get(binUrl, {
        timeout: 5000
      });
      
      if (!response.data) {
        return `BIN: ${bin}`;
      }

      const data = response.data;
      const type = data.type?.toUpperCase() || '';
      const brand = data.brand?.toUpperCase() || '';
      const bank = data.bank?.name?.toUpperCase() || 'UNKNOWN BANK';
      const country = data.country?.alpha2 || '';
      
      return `${type} / ${brand} / ${bank} / # ${country}`;
    } catch (error) {
      return `BIN: ${bin}`;
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

  const checkAdyenStatus = async () => {
    try {
      const response = await fetch(`${process.env.API_1_URL}/adyen/check-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha na verificação do Adyen');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status do Adyen:', error);
      return false;
    }
  };

  useEffect(() => {
    const verifyAdyen = async () => {
      const status = await checkAdyenStatus();
      if (status) {
        // Lógica para quando o Adyen estiver funcionando
        console.log('Adyen está funcionando corretamente');
      } else {
        // Lógica para quando houver falha
        console.log('Problema com a integração do Adyen');
      }
    };

    verifyAdyen();
  }, []);

  // Adicionar funções para limpar resultados
  const clearLives = () => {
    alerts.fire({
      icon: 'warning',
      title: 'Clear Lives',
      text: 'Do you want to clear all lives?',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setLives([]);
      }
    });
  };

  const clearDies = () => {
    alerts.fire({
      icon: 'warning',
      title: 'Clear Dies',
      text: 'Do you want to clear all dies?',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setDies([]);
      }
    });
  };

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
              <div
                className="warns"
                style={{ fontSize: '15px', letterSpacing: 1.05 }}
              >
                <div
                  onClick={() => {
                    router.push('/dashboard/wallet');
                  }}
                  style={{
                    color: '#f5f5f5',
                    background: 'linear-gradient(to left, greenyellow, #111)',
                  }}
                >
                  {t('promotion')}
                </div>
              </div>

              <br />

              <AccountDetails user={user} />
             

              <div className="checker">
                <h2>
                  <span>
                    {' '}
                    <FontAwesomeIcon icon={faCreditCard} /> CC CHECKER <br />
                    <small
                      style={{
                        fontSize: '14px',
                        opacity: 0.9,
                        fontWeight: 'lighter',
                      }}
                    >
                      {checkerType === 'adyen' ? 'Adyen Gateway: Fullz & Gens' : 'Premium Gateway'}
                    </small>
                  </span>
                  <div>
                    <select 
                      value={checkerType}
                      onChange={(e) => setCheckerType(e.target.value)}
                      style={{
                        marginRight: '10px',
                        padding: '5px',
                        borderRadius: '5px'
                      }}
                    >
                      <option value="adyen">Adyen ($0.50/live)</option>
                      <option value="premium">Premium ($1.00/live, $0.10/die)</option>
                    </select>
                  </div>
                </h2>
                <form
                  onSubmit={handleCheck}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <textarea
                    onChange={(e) => setList(e.target.value)}
                    placeholder="Format: 
       50541054150454054|00|0000|000"
                    name=""
                    id=""
                    cols="30"
                    rows="10"
                  ></textarea>
                  <button style={{ marginTop: '20px' }}>
                    {' '}
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
                  <span style={{ 
                    color: '#f5f5f5', 
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    LIVES
                    {lives.length > 0 && (
                      <button
                        onClick={clearLives}
                        style={{
                          padding: '2px 8px',
                          fontSize: '12px',
                          backgroundColor: '#333',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear Lives
                      </button>
                    )}
                  </span>
                  {lives.length < 1 && (
                    <small style={{ opacity: 0.5 }}>Nothing yet...</small>
                  )}
                  {lives.map((item) => (
                    <div key={item.key} style={{ 
                      backgroundColor: '#111',
                      padding: '10px',
                      marginBottom: '5px',
                      borderRadius: '5px'
                    }}>
                      {item.return} / {item.cc} / {item.bin} / CHECKED BY SECCX.PRO
                    </div>
                  ))}
                </div>

                <div className="dies" style={{ marginTop: '30px' }}>
                  <span style={{
                    color: '#f5f5f5',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    DIES
                    {dies.length > 0 && (
                      <button
                        onClick={clearDies}
                        style={{
                          padding: '2px 8px',
                          fontSize: '12px',
                          backgroundColor: '#333',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear Dies
                      </button>
                    )}
                  </span>
                  <br />
                  {dies.length < 1 && (
                    <small style={{ opacity: 0.5 }}>Nothing yet...</small>
                  )}
                  {dies.map((item) => (
                    <div key={item.key} style={{
                      backgroundColor: '#111',
                      padding: '10px',
                      marginBottom: '5px',
                      borderRadius: '5px'
                    }}>
                      {item.return} / {item.cc} / {item.bin} / CHECKED BY SECCX.PRO
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                ></div>
              </div>
            </>
          )}





            
          <br />
          <Footer />
        </div>
      )}
    </>
  );
}
