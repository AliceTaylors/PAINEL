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

    if (parseFloat(user.order.amount) >= 6) {
      return;
    }

    if (isNaN(balance)) {
      alerts.fire({ icon: "warning", text: "Enter a valid amount to charge" });
      return;
    }

    if (parseFloat(balance) < 5) {
      alerts.fire({
        icon: "warning",
        text: "Minimum value is 5 USD",
      });
      return;
    }
    if (parseFloat(balance) > 1000) {
      alerts.fire({
        icon: "warning",
        text: "Maximum deposit is $1000",
      });
      return;
    }
    alerts.showLoading();

    const res = await axios.post(
      "/api/transactions",
      { amount: balance, currency },
      { headers: { token: window.localStorage.getItem("token") } }
    );

    alerts.close();

    if (res.data.error) {
      alerts.fire({ icon: "warning", text: res.data.error });
      return;
    }

    getUser();
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
        <div className="wallet-page">
          <Head>
            <title>checkercc | Wallet</title>
          </Head>
          
          <div className="container">
            <Header user={user} />

            <div className="content">
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

                  <span
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Image
                      src={`https://coinicons-api.vercel.app/api/icon/${user.order.currency.toLowerCase()}`}
                      width={30}
                      height={30}
                    />{" "}
                    {user.order.currency}
                  </span>

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
                    <select
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        padding: "5px",
                        fontSize: "16px",
                        background: "#000",
                        borderRadius: "5px",
                        border: "1px solid #333",
                      }}
                      className="input"
                    >
                      <option value={"BTC"}>Bitcoin (BTC)</option>
                      <option value={"ETH"}>Ethereum (ETH)</option>
                      <option value={"LTC"}>Litecoin (LTC)</option>
                      <option value={"DOGE"}>Dogecoin (DOGE)</option>
                    </select>
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
                      <div className="crypto-icons">
                        <img
                          src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
                          alt="Bitcoin"
                          className="crypto-icon"
                        />
                        <img 
                          src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
                          alt="Ethereum"
                          className="crypto-icon"
                        />
                        <img
                          src="https://assets.coingecko.com/coins/images/2/small/litecoin.png" 
                          alt="Litecoin"
                          className="crypto-icon"
                        />
                        <img
                          src="https://assets.coingecko.com/coins/images/325/small/Tether.png"
                          alt="USDT"
                          className="crypto-icon"
                        />
                        <img
                          src="https://assets.coingecko.com/coins/images/5/small/dogecoin.png"
                          alt="Dogecoin"
                          className="crypto-icon"
                        />
                        <span>+</span>
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
            </div>

            <Footer />
          </div>

          <style jsx>{`
            .wallet-page {
              min-height: 100vh;
              background: #000;
              color: #fff;
              display: flex;
              flex-direction: column;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
              flex: 1;
              display: flex;
              flex-direction: column;
            }

            .content {
              flex: 1;
            }

            .crypto-icons {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              flex-wrap: wrap;
              margin: 15px 0;
            }

            .crypto-icon {
              width: 32px;
              height: 32px;
              transition: all 0.3s ease;
              filter: brightness(0.9);
              opacity: 0.8;
              background: rgba(255,255,255,0.1);
              padding: 5px;
              border-radius: 50%;
            }

            .crypto-icon:hover {
              filter: brightness(1);
              opacity: 1;
              transform: translateY(-2px);
              background: rgba(255,255,255,0.2);
            }

            @media (max-width: 768px) {
              .crypto-icons {
                gap: 12px;
              }
              
              .crypto-icon {
                width: 28px;
                height: 28px;
                padding: 4px;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
