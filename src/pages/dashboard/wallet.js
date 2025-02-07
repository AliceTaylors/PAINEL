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
} from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import Footer from "../../components/Footer";
import useTranslation from "next-translate/useTranslation";
import QRCode from "react-qr-code";
import { createPixDeposit } from "../../services/mercadopago";

const CRYPTO_CURRENCIES = {
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    image: "/btc.png",
    color: "#F7931A"
  },
  ETH: {
    name: "Ethereum", 
    symbol: "ETH",
    image: "/eth.png",
    color: "#627EEA"
  },
  LTC: {
    name: "Litecoin",
    symbol: "LTC", 
    image: "/ltc.png",
    color: "#345D9D"
  },
  DOGE: {
    name: "Dogecoin",
    symbol: "DOGE",
    image: "/doge.png",
    color: "#C2A633"
  }
};

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

export default function Deposit() {
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getTransaction() {
    try {
      const resTransaction = await axios.get("/api/transactions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (!resTransaction.data) {
        return;
      }

      setPaymentStatus(resTransaction.data.status);

      if (resTransaction.data.status === "completed") {
        alerts.fire({
          icon: "success",
          text: "Deposit completed successfully!",
        });
        setPaymentStatus("completed");
        getUser(); // Refresh user data after completion
        return;
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
      alerts.fire({
        icon: "error",
        text: "Error checking transaction status. Please try again.",
      });
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
  }, []);

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

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      if (parseFloat(user.order.amount) >= 6) {
        return;
      }

      if (isNaN(balance) || !balance) {
        alerts.fire({ icon: "warning", text: "Enter a valid amount to charge" });
        return;
      }

      const amount = parseFloat(balance);
      
      if (amount < 5) {
        alerts.fire({
          icon: "warning",
          text: "Minimum value is 5 USD",
        });
        return;
      }
      
      if (amount > 1000) {
        alerts.fire({
          icon: "warning",
          text: "Maximum deposit is $1000",
        });
        return;
      }

      alerts.showLoading();

      const res = await axios.post(
        "/api/transactions",
        { amount, currency },
        { headers: { token: window.localStorage.getItem("token") } }
      );

      alerts.close();

      if (res.data.error) {
        alerts.fire({ icon: "warning", text: res.data.error });
        return;
      }

      await getUser();
      
    } catch (error) {
      console.error("Error submitting deposit:", error);
      alerts.fire({ 
        icon: "error", 
        text: "Error processing deposit. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const handlePixDeposit = async (amount) => {
    try {
      // Avisa sobre a conversão
      await alerts.fire({
        icon: 'info',
        title: 'Conversão para USD',
        text: 'O valor em reais será convertido para dólares usando a cotação atual.',
        confirmButtonText: 'Continuar'
      });

      const deposit = await createPixDeposit(amount);
      
      // Mostra os detalhes da conversão
      alerts.fire({
        icon: 'success',
        title: 'PIX Gerado',
        html: `
          <p>Valor em BRL: R$ ${deposit.amountBRL}</p>
          <p>Valor em USD: $ ${deposit.amountUSD}</p>
          <p>Cotação: R$ ${deposit.dollarRate}</p>
          <br>
          <small>O valor em dólares será creditado após a confirmação do pagamento</small>
        `
      });

      // ... resto do código para mostrar QR Code etc
    } catch (error) {
      alerts.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao gerar depósito PIX'
      });
    }
  };

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
      {user && (
        <>
          <Head>
            <title>CHECKERCC | Wallet</title>
          </Head>
          <div className="root" id="#rootpage">
            <Header user={user} />

            <h2>
              <span>
                {" "}
                <FontAwesomeIcon icon={faWallet} /> WALLET{" "}
              </span>
            </h2>
            <div
              style={{
                display: "flex",
                gap: "5px",
                width: "100% !important",
                flex: "1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  marginBottom: "10px",
                  flexDirection: "column",
                }}
              >
                <small>Account</small>
                <span>{user.login}</span>
              </div>{" "}
              <div
                style={{
                  background: "#222",
                  height: "100%",
                  border: "1px solid #222",
                  width: "1px",
                  margin: "0 20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  marginBottom: "10px",
                  flexDirection: "column",
                }}
              >
                <small>Balance</small>
                <span>${user?.balance.toFixed(2)} USD</span>
              </div>
            </div>
            <div
              style={{
                background: "#222",
                height: "1px",
                marginBottom: "25px",
              }}
            ></div>
            {parseFloat(user.order.amount) >= 5 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "30px",
                }}
              >
                <h3 style={{ lineHeight: 0 }}>Pending deposit!</h3>
                <span style={{ opacity: 0.7 }}>
                  Total: {user.order.amount.toFixed(2)} USD
                </span>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "5px",
                  marginBottom: "15px"
                }}>
                  <div style={{ width: 24, height: 24, position: 'relative' }}>
                    <Image
                      src={CRYPTO_CURRENCIES[user.order.currency].image}
                      alt={CRYPTO_CURRENCIES[user.order.currency].name}
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                  <span style={{ 
                    color: CRYPTO_CURRENCIES[user.order.currency].color,
                    fontWeight: "500"
                  }}>
                    {CRYPTO_CURRENCIES[user.order.currency].name} ({CRYPTO_CURRENCIES[user.order.currency].symbol})
                  </span>
                </div>

                <QRCode
                  value={user.order.address}
                  size={128}
                  style={{ border: "2px solid #fff" }}
                />

                <CopyToClipboard
                  text={user.order.address}
                  onCopy={() =>
                    alerts.fire({
                      icon: "success",
                      text: "Copied to clipboard!",
                      timer: 500,
                    })
                  }
                >
                  <small
                    style={{
                      fontFamily: "monospace",
                      fontSize: "16px",
                      width: "100% !important",
                      cursor: "pointer",
                      letterSpacing: "1.5px",
                      padding: "2px 3px",
                      background: "rgba(0,0,0,0.45)",
                      border: "1px solid #222",
                      borderRadius: "5px",
                      wordBreak: "break-all",
                      msWordBreak: "break-all",
                      maxWidth: "50%",
                      color: "#999",
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy} /> {user.order.address}
                  </small>
                </CopyToClipboard>
                <span>Amount:</span>
                <CopyToClipboard
                  text={user.order.pricing}
                  onCopy={() =>
                    alerts.fire({
                      icon: "success",
                      text: "Copied to clipboard!",
                      timer: 500,
                    })
                  }
                >
                  <small
                    style={{
                      fontFamily: "monospace",
                      fontSize: "16px",
                      width: "100% !important",
                      cursor: "pointer",
                      letterSpacing: "1.5px",
                      padding: "2px 3px",
                      background: "rgba(0,0,0,0.45)",
                      border: "1px solid #222",
                      borderRadius: "5px",
                      wordBreak: "break-all",
                      msWordBreak: "break-all",
                      maxWidth: "50%",
                      color: "#999",
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy} /> {user.order.pricing} BTC
                  </small>
                </CopyToClipboard>
                <button onClick={handleSync} style={{ marginTop: "10px" }}>
                  <FontAwesomeIcon icon={faRefresh} /> Sync
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#111",
                    fontSize: "16px",
                    opacity: 0.5,
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Cancel
                </button>
              </div>
            )}
            <form className="recharge" onSubmit={handleSubmit}>
              {parseFloat(user.order.amount) < 5 && (
                <>
                  <div
                    style={{
                      marginBottom: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <h3
                      style={{
                        display: "flex",
                        marginBottom: "5px",
                        lineHeight: "0px",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      <span>{t("addfunds")}</span>
                    </h3>
                  </div>

                  <label htmlFor="" style={{ marginBottom: "2px" }}>
                    Amount:
                  </label>
                  <CurrencyInput
                    style={{ marginTop: 0 }}
                    defaultValue={balance}
                    allowNegativeValue={false}
                    inputMode="numeric"
                    prefix={""}
                    suffix={" USD"}
                    onValueChange={(e) => setBalance(e)}
                  />

                  <label htmlFor="" style={{ marginBottom: "2px" }}>
                    Currency:
                  </label>
                  <div className="crypto-icons" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "10px",
                    marginBottom: "10px"
                  }}>
                    {Object.entries(CRYPTO_CURRENCIES).map(([key, currency]) => (
                      <div 
                        key={key} 
                        onClick={() => setCurrency(key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: currency === CRYPTO_CURRENCIES[currency] ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.3)",
                          borderRadius: "8px",
                          border: `1px solid ${currency.color}`,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          opacity: currency === CRYPTO_CURRENCIES[currency] ? 1 : 0.7,
                          ':hover': {
                            opacity: 1,
                            transform: "scale(1.05)"
                          }
                        }}
                      >
                        <div style={{ width: 24, height: 24, position: 'relative', marginRight: "8px" }}>
                          <Image
                            src={currency.image}
                            alt={currency.name}
                            layout="fill"
                            objectFit="contain"
                            priority
                          />
                        </div>
                        <span style={{ 
                          color: currency.color,
                          fontWeight: "500",
                          fontSize: "14px"
                        }}>
                          {currency.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "5px",
                    marginBottom: "15px"
                  }}>
                    <div style={{ width: 24, height: 24, position: 'relative' }}>
                      <Image
                        src={CRYPTO_CURRENCIES[currency].image}
                        alt={CRYPTO_CURRENCIES[currency].name}
                        layout="fill"
                        objectFit="contain"
                        priority
                      />
                    </div>
                    <span style={{ 
                      color: CRYPTO_CURRENCIES[currency].color,
                      fontWeight: "500"
                    }}>
                      {CRYPTO_CURRENCIES[currency].name} ({CRYPTO_CURRENCIES[currency].symbol})
                    </span>
                  </div>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isNaN(balance) ? "#222" : false,
                    }}
                    disabled={isNaN(balance)}
                  >
                    {isNaN(balance)
                      ? "Invalid value"
                      : `Add ${parseFloat(balance).toFixed(2)} USD`}
                    {/* <small style={{ fontSize: "15px", marginLeft: "5px" }}>
                      ({btcBalance} BTC)
                    </small> */}
                  </button>
                  <div
                    className="payment-methods"
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    <div className="crypto-icons" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      justifyContent: "center"
                    }}>
                      {Object.entries(CRYPTO_CURRENCIES).map(([key, currency]) => (
                        <div key={key} style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "4px 8px",
                          background: "rgba(0,0,0,0.3)",
                          borderRadius: "5px",
                          border: `1px solid ${currency.color}`,
                          cursor: "pointer"
                        }}>
                          <Image
                            src={currency.image}
                            alt={currency.symbol}
                            width={20}
                            height={20}
                            style={{ marginRight: "5px" }}
                          />
                          <span style={{ color: currency.color }}>{currency.symbol}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="addfunds-methods"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "end",
                      }}
                    >
                      <small
                        onClick={() => {
                          router.push("/dashboard/pix-deposits");
                        }}
                        style={{
                          cursor: "pointer",
                          letterSpacing: 1.2,
                          padding: "4px",
                          color: "#6b21a8",
                          fontWeight: "bold",
                          fontSize: "16px",
                          borderRadius: "5px",
                          display: "flex",
                          flexDirection: "row",
                          alignitems: "center",
                          gap: "5px",
                        }}
                      >
                        <Image width={20} height={15} src="/pix.png" /> Pay with
                        PIX (Brazil)
                        <FontAwesomeIcon icon={faArrowRight} />
                      </small>
                    </div>
                  </div>
                </>
              )}
            </form>
            <hr />
            <div className="recharge-redeem">
              <div
                style={{
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    marginBottom: "5px",
                    lineHeight: "0px",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  <span>{t("redeem-title")}</span>
                </h3>
              </div>
              <form onSubmit={handleRedeem}>
                <label htmlFor="" style={{ marginBottom: "2px" }}>
                  Code:
                </label>
                <input
                  type="text"
                  placeholder="ABC-123-456-789"
                  name=""
                  id=""
                  onChange={(e) => setRedeemCode(e.target.value)}
                />
                <button>{t("redeem")}</button>
              </form>
            </div>

            <br />
            <hr />
            <div className="recharge-history">
              <div style={{ marginBottom: 0 }}>
                <h3 style={{ fontWeight: "bold", margin: 0 }}>
                  {t("transaction-history")}
                </h3>
                <small style={{ opacity: 0.5 }}>
                  Click in log to see details
                </small>
              </div>
              <br />
              <div>
                <div>
                  <table
                    style={{
                      width: "100%",
                      border: "1px solid #222 !important",
                      borderRadius: "10px",
                    }}
                    id="customers"
                  >
                    <tr>
                      <th>Log</th>
                      <th>Amount</th>
                    </tr>

                    {user && (
                      <>
                        {user.logs.slice(0, logsNumber).map((log) => (
                          <tr
                            style={{ cursor: "pointer" }}
                            key={log._id}
                            onClick={() => {
                              alerts.fire({
                                title: log.history_type,
                                text: log.data,
                              });
                            }}
                          >
                            <td>{log.history_type}</td>
                            {log.cost === 0 ? (
                              <td>
                                <small
                                  style={{
                                    fontFamily: "monospace",
                                    color: "#6b21a8",
                                    letterSpacing: "4px",
                                  }}
                                >
                                  FREE
                                </small>
                              </td>
                            ) : (
                              <td>
                                {" "}
                                $
                                {parseFloat(parseFloat(log.cost) * -1).toFixed(
                                  2
                                )}{" "}
                              </td>
                            )}
                          </tr>
                        ))}
                      </>
                    )}
                  </table>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "20px",
                      flexDirection: "columns",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        setLogsNumber(logsNumber + 5);
                      }}
                      style={{ fontSize: "12px", padding: "5px 10px" }}
                    >
                      + {t("show-more")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
    </>
  );
}
