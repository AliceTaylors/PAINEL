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
import CopyToClipboard from "react-copy-to-clipboard";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import QRCode from "react-qr-code";
import { useRouter } from "next/router";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function PixDeposit() {
  const [balance, setBalance] = useState(5);
  const [user, setUser] = useState(null);
  const [pixDeposit, setPixDeposit] = useState(null);
  const alerts = withReactContent(Swal);
  const router = useRouter();

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
  useEffect(() => {
    getUser();
  }, []);

  const getPixDeposit = async (id) => {
    const res = await axios.get("/api/pix-deposits?id=" + id, {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
      return;
    }
    console.log(res.data.pixDeposit);

    setPixDeposit(res.data.pixDeposit);
  };

  const handleSync = async () => {
    if (!router.query.id) return;

    alerts.showLoading();

    await getPixDeposit(router.query.id);

    alerts.hideLoading();
    alerts.close();
  };

  useEffect(() => {
    if (router.query.id) {
      getPixDeposit(router.query.id);
    }
  }, [router.query.id]);

  return (
    <>
      <Head>
        <title>checkercc | PIX Deposits</title>
      </Head>
      <div className="root" id="#rootpage">
        <Header user={user} />

        <h2 style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              itemsCenter: "center",
              gap: "5px",
            }}
          >
            {" "}
            <Image width={30} height={25} src={"/pix.png"} /> PIX DEPOSIT{" "}
          </span>
          <span
            style={{ fontSize: "14px", fontWeight: "normal", opacity: 0.5 }}
          >
            ID: {pixDeposit?._id}
          </span>
        </h2>
        {pixDeposit && pixDeposit.status == "approved" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "50px 0px",
              fontSize: "32px",
              color: "limegreen",
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Deposit approved!</span>
          </div>
        )}
        {pixDeposit && pixDeposit.status !== "approved" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <QRCode
              style={{ border: "2px solid #fff" }}
              size={128}
              value={pixDeposit.externalDepositAddress}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", opacity: "0.5" }}>Address:</span>
              <CopyToClipboard
                text={pixDeposit.externalDepositAddress}
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
                  <FontAwesomeIcon icon={faCopy} />{" "}
                  {pixDeposit.externalDepositAddress}
                </small>
              </CopyToClipboard>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", opacity: "0.5" }}>Amount:</span>
              <span>
                {parseFloat(pixDeposit.amount).toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <button onClick={handleSync} style={{ marginTop: "10px" }}>
              <FontAwesomeIcon icon={faRefresh} /> Sync
            </button>
            <Link href="/dashboard/pix-deposits">
              <button style={{ background: "#111" }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
