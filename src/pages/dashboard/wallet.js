import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useRouter } from "next/router";
import {
  faCopy,
  faArrowRight,
  faWallet,
  faArrowLeft,
  faEye,
  faRefresh,
  faBitcoinSign,
  faMoneyBillTransfer,
  faHistory,
  faChartLine,
  faCreditCard,
  faCoins,
  faQrcode,
  faGift,
  faCoins as faBinance,
  faDollarSign as faUsdt,
  faMoneyBill as faLtc,
  faQrcode as faPix
} from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import Footer from "../../components/Footer";
import useTranslation from "next-translate/useTranslation";
import QRCode from "react-qr-code";

const modalStyles = {
  overlay: {
    background: "rgba(0,0,0,0.8)",
  },

  content: {
    top: "50%",
    background: "#000",
    left: "50%",
    right: "auto",
    bottom: "auto",
    overflowY: "scroll",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    border: "1px solid #222 !important",
  },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next");

export default function Wallet() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [logsNumber, setLogsNumber] = useState(5);
  const router = useRouter();

  const [redeemCode, setRedeemCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("WAITING");
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(5);
  const [counter, setCounter] = useState(30);

  const [currency, setCurrency] = useState("BTC");

  const { t, lang } = useTranslation("dashboard");

  const [amount, setAmount] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("BTC");

  const paymentMethods = {
    BTC: {
      name: "Bitcoin",
      icon: faBitcoinSign,
      color: "#f7931a",
      min: 5
    },
    BNB: {
      name: "Binance Coin",
      icon: faBinance,
      color: "#F3BA2F",
      min: 5
    },
    LTC: {
      name: "Litecoin", 
      icon: faLtc,
      color: "#345d9d",
      min: 5
    },
    USDT: {
      name: "Tether",
      icon: faUsdt, 
      color: "#26A17B",
      min: 5
    },
    PIX: {
      name: "PIX",
      icon: faPix,
      color: "#32BCAD",
      min: 5
    }
  };

  async function getTransaction() {
    const resTransaction = await axios.get("/api/transactions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    setPaymentStatus(resTransaction.data.status);

    if (resTransaction.data.status === "completed") {
      alerts.fire({
        icon: "success",
        text: "Deposit completed successfully!",
      });
      setPaymentStatus("completed");
      return;
    }
  }
  const getUser = async () => {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
      return;
    }

    setUser(res.data.user);
    getTransaction();

    if (parseFloat(res.data.user.order.amount) > 4) {
      getTransaction();
    } else {
    }
  };
  useEffect(() => {
    getUser();
    const interval = setInterval(getOrder, 5000);
    return () => clearInterval(interval);
  }, []);

  const getOrder = async () => {
    const res = await axios.get('/api/transactions', {
      headers: { token: window.localStorage.getItem('token') },
    });

    setOrder(res.data.order);
  };

  async function handleSync(e) {
    if (e) e.preventDefault();
    setPaymentStatus("...");
    setCounter(30);
    alerts.fire({
      icon: "success",
      text: "Syncing...",
      timer: 500,
    });
    getTransaction();
  }

  async function handleCancel(e) {
    e.preventDefault();

    alerts
      .fire({
        icon: "question",
        text: "Do you really want to cancel the order?",
        cancelButtonText: "No",
        confirmButtonText: "Yes",
        showCancelButton: true,
      })
      .then(async (res) => {
        if (res["isConfirmed"]) {
          await axios.put("/api/transactions", "", {
            headers: { token: window.localStorage.getItem("token") },
          });
          getUser();
        }
      });

    router.push("/dashboard/wallet#rootpage");
  }

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/transactions',
        { amount },
        { headers: { token: window.localStorage.getItem('token') } }
      );

      if (res.data.error) {
        alerts.fire({
          icon: 'error',
          text: res.data.error,
        });
        setLoading(false);
        return;
      }

      setOrder(res.data.order);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alerts.fire({
        icon: 'error',
        text: 'An error occurred. Please try again.',
      });
    }
  };

  async function handleRedeem(e) {
    e.preventDefault();

    const res = await axios.post(
      "/api/redeem",
      { code: redeemCode },
      { headers: { token: window.localStorage.getItem("token") } }
    );

    if (res.data.error) {
      alerts.fire({ icon: "warning", text: res.data.error });
      return;
    }

    alerts.fire({
      icon: "success",
      text: "$" + res.data.amount + "credits code redeemed successfully!",
    });
  }
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, []);

  // Verifica se o contador chegou a zero
  useEffect(() => {
    if (counter === 0) {
      // Faça algo quando o contador chegar a zero
      // Por exemplo, exiba uma mensagem ou execute uma ação
      setCounter(30);
      handleSync();
    }
  }, [counter]);

  return (
    <>
      <Head>
        <title>CHECKERCC | Wallet</title>
      </Head>
      {user && (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />

          <div className="wallet-container" style={{ padding: "20px" }}>
            <div className="balance-card" style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #222 100%)",
              padding: "30px",
              borderRadius: "15px",
              marginBottom: "30px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(0,255,0,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                transform: "translate(30%, -30%)"
              }}/>
              <h2 style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                color: "#00ff00",
                marginBottom: "20px",
                position: "relative"
              }}>
                <FontAwesomeIcon icon={faWallet} />
                Your Balance
              </h2>
              <div style={{ 
                fontSize: "2.5em", 
                fontWeight: "bold",
                color: "#fff",
                position: "relative"
              }}>
                ${user.balance.toFixed(2)}
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: order ? "1fr 1fr" : "1fr",
              gap: "30px"
            }}>
              <div style={{
                background: "#1a1a1a",
                padding: "30px",
                borderRadius: "15px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{
                  color: "#00ff00",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <FontAwesomeIcon icon={faMoneyBillTransfer} />
                  Deposit Funds
                </h2>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: "10px",
                  marginBottom: "20px"
                }}>
                  {Object.entries(paymentMethods).map(([key, method]) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      style={{
                        background: paymentMethod === key ? 
                          `linear-gradient(135deg, ${method.color}22 0%, ${method.color}44 100%)` : 
                          "#222",
                        border: `1px solid ${paymentMethod === key ? method.color : "#333"}`,
                        borderRadius: "8px",
                        padding: "15px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={method.icon} 
                        style={{ 
                          color: method.color,
                          fontSize: "1.5em" 
                        }}
                      />
                      <span style={{ 
                        color: paymentMethod === key ? "#fff" : "#888",
                        fontSize: "0.9em"
                      }}>
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleDeposit}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "10px",
                      color: "#888"
                    }}>
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Min. $${paymentMethods[paymentMethod].min}`}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#222",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "1.1em"
                      }}
                      min={paymentMethods[paymentMethod].min}
                      step="0.01"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: loading ? 
                        "#333" : 
                        `linear-gradient(135deg, ${paymentMethods[paymentMethod].color} 0%, ${paymentMethods[paymentMethod].color}aa 100%)`,
                      border: "none",
                      borderRadius: "8px",
                      color: "#000",
                      fontSize: "1.1em",
                      fontWeight: "bold",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {loading ? "Processing..." : `Deposit with ${paymentMethods[paymentMethod].name}`}
                  </button>
                </form>

                <div style={{
                  marginTop: "30px",
                  padding: "20px",
                  background: "#222",
                  borderRadius: "8px"
                }}>
                  <h3 style={{
                    color: "#00ff00",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <FontAwesomeIcon icon={faGift} />
                    Redeem Code
                  </h3>
                  <form onSubmit={handleRedeem} style={{
                    display: "flex",
                    gap: "10px"
                  }}>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      placeholder="Enter code"
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "12px 20px",
                        background: "#00ff00",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000",
                        fontWeight: "bold"
                      }}
                    >
                      Redeem
                    </button>
                  </form>
                </div>
              </div>

              {order && (
                <div style={{
                  background: "#1a1a1a",
                  padding: "30px",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                }}>
                  <h2 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#00ff00',
                    marginBottom: '20px'
                  }}>
                    <FontAwesomeIcon icon={faQrcode} />
                    Payment Details
                  </h2>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <QRCode
                        value={order.address}
                        size={200}
                        style={{ background: '#fff', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>
                    <div style={{
                      background: '#222',
                      padding: '15px',
                      borderRadius: '8px',
                      wordBreak: 'break-all'
                    }}>
                      <div style={{ color: '#888', marginBottom: '5px' }}>Amount:</div>
                      <div style={{ color: '#00ff00', fontSize: '1.2em' }}>
                        {order.amount} {order.currency}
                      </div>
                    </div>
                    <div style={{
                      background: '#222',
                      padding: '15px',
                      borderRadius: '8px',
                      wordBreak: 'break-all'
                    }}>
                      <div style={{ color: '#888', marginBottom: '5px' }}>Address:</div>
                      <div style={{ color: '#fff' }}>{order.address}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              marginTop: "30px",
              background: "#1a1a1a",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                color: '#00ff00',
                marginBottom: '20px'
              }}>
                <FontAwesomeIcon icon={faHistory} />
                Transaction History
              </h2>
              <div className="logs" style={{
                display: 'grid',
                gap: '10px'
              }}>
                {user.logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#222',
                      padding: '15px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FontAwesomeIcon 
                        icon={log.cost > 0 ? faCoins : faCreditCard}
                        style={{ color: log.cost > 0 ? '#00ff00' : '#ff4444' }}
                      />
                      <div>
                        <div style={{ color: '#fff' }}>{log.history_type}</div>
                        {log.data && (
                          <div style={{ color: '#888', fontSize: '0.9em' }}>{log.data}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      color: log.cost > 0 ? '#00ff00' : '#ff4444',
                      fontWeight: 'bold'
                    }}>
                      ${Math.abs(log.cost).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      )}
    </>
  );
}
