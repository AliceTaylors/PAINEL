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
  faQrcode as faPix,
  faSync,
  faMoneyBillWave
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
    
    getUser();
    setRedeemCode('');
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
        <title>SECCX.PRO | Wallet</title>
      </Head>
      {user && (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />

          <div className="wallet-container">
            <div className="balance-card">
              <FontAwesomeIcon icon={faWallet} className="card-icon" />
              <div className="balance-info">
                <h2>Current Balance</h2>
                <span className="balance-amount">${user.balance?.toFixed(2)}</span>
              </div>
              <button className="sync-button" onClick={handleSync}>
                <FontAwesomeIcon icon={faSync} spin={counter === 30} />
                <span>{counter}s</span>
              </button>
            </div>

            <div className="wallet-sections">
              <div className="wallet-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faGift} />
                  <h2>Redeem Code</h2>
                </div>
                <form onSubmit={handleRedeem} className="redeem-form">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    placeholder="Enter your code"
                    required
                  />
                  <button type="submit">
                    <FontAwesomeIcon icon={faCoins} />
                    Redeem
                  </button>
                </form>
              </div>

              <div className="wallet-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faHistory} />
                  <h2>Transaction History</h2>
                </div>
                <div className="history-list">
                  {user.logs?.slice(0, 10).map((log, index) => (
                    <div key={index} className="history-item">
                      <FontAwesomeIcon 
                        icon={faMoneyBillWave}
                        className={log.cost > 0 ? 'income' : 'expense'}
                      />
                      <div className="history-details">
                        <span className="history-type">{log.history_type}</span>
                        <span className="history-amount">
                          {log.cost > 0 ? '+' : ''}{log.cost?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      )}

      <style jsx>{`
        .wallet-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .balance-card {
          background: rgba(0,255,68,0.03);
          border: 1px solid rgba(0,255,68,0.1);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .card-icon {
          font-size: 2.5rem;
          color: #00ff44;
        }

        .balance-info {
          flex: 1;
        }

        .balance-info h2 {
          color: #888;
          margin: 0 0 10px 0;
          font-size: 1.1rem;
        }

        .balance-amount {
          font-size: 2rem;
          color: #00ff44;
          font-weight: 600;
        }

        .sync-button {
          background: rgba(0,255,68,0.1);
          border: none;
          color: #00ff44;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .sync-button:hover {
          background: rgba(0,255,68,0.2);
          transform: translateY(-2px);
        }

        .wallet-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .wallet-section {
          background: rgba(0,255,68,0.03);
          border: 1px solid rgba(0,255,68,0.1);
          border-radius: 20px;
          padding: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #00ff44;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }

        .redeem-form {
          display: flex;
          gap: 10px;
        }

        input {
          flex: 1;
          padding: 12px 15px;
          border-radius: 12px;
          border: 1px solid #222;
          background: rgba(17,17,17,0.7);
          color: #fff;
          font-size: 0.95rem;
        }

        input:focus {
          outline: none;
          border-color: #00ff44;
        }

        button {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          border: none;
          padding: 12px 25px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,255,68,0.2);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(17,17,17,0.7);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          transform: translateX(5px);
        }

        .history-details {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-type {
          color: #888;
          font-size: 0.9rem;
        }

        .history-amount {
          color: #00ff44;
          font-weight: 600;
        }

        .income {
          color: #00ff44;
        }

        .expense {
          color: #ff4444;
        }

        @media (max-width: 768px) {
          .wallet-container {
            padding: 15px;
          }

          .balance-card {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .balance-amount {
            font-size: 1.8rem;
          }

          .redeem-form {
            flex-direction: column;
          }

          button {
            width: 100%;
            justify-content: center;
          }

          .history-item {
            padding: 12px;
          }

          .history-type {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
