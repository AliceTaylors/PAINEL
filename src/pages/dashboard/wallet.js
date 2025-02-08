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
  faSync
} from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import Footer from "../../components/Footer";
import useTranslation from "next-translate/useTranslation";
import QRCode from "react-qr-code";

const alerts = withReactContent(Swal);

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
    maxWidth: "500px",
    border: "1px solid #222",
  },
};

Modal.setAppElement("#__next");

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [counter, setCounter] = useState(30);
  const [paymentStatus, setPaymentStatus] = useState("...");
  const router = useRouter();
  const { t } = useTranslation("common");

  async function getUser() {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
      return;
    }

    setUser(res.data.user);
  }

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
    getUser();
    getOrder();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (counter === 0) {
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
              <div className="balance-info">
                <h3>Current Balance</h3>
                <span className="balance-amount">${user.balance?.toFixed(2)}</span>
              </div>
              <button className="sync-button" onClick={handleSync}>
                <FontAwesomeIcon icon={faSync} spin={counter === 30} />
                <span>{counter}s</span>
              </button>
            </div>

            <div className="wallet-sections">
              <div className="redeem-section">
                <h3>
                  <FontAwesomeIcon icon={faGift} /> Redeem Code
                </h3>
                <form onSubmit={handleRedeem}>
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    placeholder="Enter your code"
                    required
                  />
                  <button type="submit">
                    <FontAwesomeIcon icon={faCoins} /> Redeem
                  </button>
                </form>
              </div>

              <div className="history-section">
                <h3>
                  <FontAwesomeIcon icon={faHistory} /> Transaction History
                </h3>
                <div className="history-list">
                  {user.logs?.slice(0, 10).map((log, index) => (
                    <div key={index} className="history-item">
                      <div className="history-details">
                        <span className="history-type">{log.history_type}</span>
                        <span className={`history-amount ${log.cost > 0 ? 'income' : 'expense'}`}>
                          {log.cost > 0 ? '+' : ''}{log.cost?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="payment-methods">
              <div className="crypto-icons">
                <img src="https://coinicons-api.vercel.app/api/icon/btc" alt="Bitcoin" />
                <img src="https://coinicons-api.vercel.app/api/icon/eth" alt="Ethereum" />
                <img src="https://coinicons-api.vercel.app/api/icon/ltc" alt="Litecoin" />
                <img src="https://coinicons-api.vercel.app/api/icon/usdt" alt="USDT" />
                <img src="https://coinicons-api.vercel.app/api/icon/doge" alt="Dogecoin" />
              </div>
            </div>
          </div>

          <Footer />
        </div>
      )}

      <style jsx>{`
        .root {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          color: #00ff44;
          font-size: 1.8rem;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        small {
          color: #888;
          font-size: 0.9rem;
        }

        span {
          color: #00ff44;
          font-size: 1.1rem;
        }

        .recharge {
          background: rgba(0,255,68,0.03);
          border: 1px solid rgba(0,255,68,0.1);
          border-radius: 20px;
          padding: 25px;
          margin: 20px 0;
        }

        .recharge-redeem {
          background: rgba(0,255,68,0.03);
          border: 1px solid rgba(0,255,68,0.1);
          border-radius: 20px;
          padding: 25px;
        }

        .recharge-history {
          background: rgba(0,255,68,0.03);
          border: 1px solid rgba(0,255,68,0.1);
          border-radius: 20px;
          padding: 25px;
          margin-top: 20px;
        }

        h3 {
          color: #00ff44;
          font-size: 1.3rem;
          margin-bottom: 15px;
        }

        label {
          color: #888;
          display: block;
          margin-bottom: 8px;
        }

        input, select {
          width: 100%;
          padding: 12px 15px;
          background: rgba(17,17,17,0.7);
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          margin-bottom: 15px;
        }

        button {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          border: none;
          padding: 12px 25px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          font-size: 1rem;
          margin: 10px 0;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-methods {
          margin-top: 20px;
          padding: 20px;
          background: rgba(17,17,17,0.7);
          border: 1px solid #222;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .crypto-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .crypto-icons img {
          width: 32px;
          height: 32px;
          transition: all 0.3s ease;
          filter: grayscale(30%);
          opacity: 0.8;
        }

        .crypto-icons img:hover {
          transform: translateY(-2px);
          filter: grayscale(0%);
          opacity: 1;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #222;
        }

        th {
          color: #00ff44;
          font-weight: 600;
        }

        tr:hover {
          background: rgba(0,255,68,0.05);
        }

        hr {
          border: none;
          border-top: 1px solid #222;
          margin: 30px 0;
        }

        @media (max-width: 768px) {
          .root {
            padding: 15px;
          }

          h2 {
            font-size: 1.5rem;
          }

          .recharge, .recharge-redeem, .recharge-history {
            padding: 20px;
          }

          button {
            padding: 10px 20px;
          }

          .crypto-icons {
            gap: 12px;
          }

          .crypto-icons img {
            width: 28px;
            height: 28px;
          }

          table {
            font-size: 0.9rem;
          }

          th, td {
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
}
