import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Image from "next/image";
import CurrencyInput from "react-currency-input-field";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/router";

export default function PixDeposit() {
  const [balance, setBalance] = useState(5);
  const [user, setUser] = useState(null);
  const [pixDeposits, setPixDeposits] = useState([]);
  const [historyLimit, setHistoryLimit] = useState(5);
  const router = useRouter();
  const alerts = withReactContent(Swal);
  const [loadingCreatePixDeposit, setLoadingCreatePixDeposit] = useState(false);

  const getUser = async () => {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
      return;
    }

    setUser(res.data.user);
  };

  const getPixDeposits = async () => {
    const res = await axios.get("/api/pix-deposits", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
      return;
    }

    console.log(res.data.pixDeposits);
    setPixDeposits(res.data.pixDeposits);
  };

  useEffect(() => {
    getUser();
    getPixDeposits();
  }, []);

  async function createPixDeposit(e) {
    setLoadingCreatePixDeposit(true);
    alerts.showLoading();

    e.preventDefault();
    const res = await axios
      .post(
        "/api/pix-deposits",
        {
          amount: balance,
        },
        { headers: { token: window.localStorage.getItem("token") } }
      )
      .finally(() => {
        setLoadingCreatePixDeposit(false);
        alerts.hideLoading();
        alerts.close();
      });

    if (res.data.error) {
      return;
    }

    return router.push("/dashboard/pix-deposit?id=" + res.data.pixDeposit?._id);
  }

  return (
    <>
      <Head>
        <title>checkercc | PIX Deposits</title>
      </Head>
      <div className="root" id="#rootpage">
        <Header user={user} />

        <h2>
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              itemsCenter: "center",
              gap: "5px",
            }}
          >
            {" "}
            <Image width={30} height={25} src={"/pix.png"} /> PIX DEPOSITS{" "}
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
            <span>{user?.login}</span>
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
        <form className="recharge" onSubmit={createPixDeposit}>
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
            ></h3>
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
            suffix={" "}
            onValueChange={(e) => setBalance(e)}
          />
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                isNaN(balance) || loadingCreatePixDeposit ? "#222" : false,
            }}
            disabled={isNaN(balance) || loadingCreatePixDeposit}
          >
            {isNaN(balance)
              ? "Invalid value"
              : `Add ${parseFloat(balance).toFixed(2)} BRL`}
            {/* <small style={{ fontSize: "15px", marginLeft: "5px" }}>
                      ({btcBalance} BTC)
                    </small> */}
          </button>
          <div
            className="payment-methods"
            style={{
              opacity: 0.8,
            }}
          ></div>
        </form>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2.5px",
            marginBottom: "20px",
          }}
        >
          <span>History: </span>
          {pixDeposits?.slice(0, historyLimit).map((pixDeposit) => (
            <Link
              key={pixDeposit._id}
              href={"/dashboard/pix-deposit?id=" + pixDeposit._id}
            >
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #222",
                  padding: "6px",
                  borderRadius: "5px",
                }}
              >
                <span>
                  PIX Deposit{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "monospace",
                      marginLeft: "5px",
                      opacity: 0.5,
                    }}
                  >
                    {parseFloat(pixDeposit.amount).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </span>
                {pixDeposit.status != "approved" && (
                  <button style={{ padding: "6px 12px", fontSize: "16px" }}>
                    Pay
                  </button>
                )}
                {pixDeposit.status == "approved" && (
                  <span
                    style={{
                      background: "limegreen",
                      color: "black",
                      borderRadius: "5px",
                      padding: "3px",
                    }}
                  >
                    Approved
                  </span>
                )}
              </div>
            </Link>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            {historyLimit < pixDeposits?.length && (
              <button
                onClick={() => setHistoryLimit(historyLimit + 3)}
                style={{ padding: "3px", fontSize: "14px", background: "#111" }}
              >
                Show more +
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
