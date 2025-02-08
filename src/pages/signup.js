import { faArrowRight, faBarcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { NextSeo } from "next-seo";
import versionData from "../version.json";

export default function Signup() {
  const [status, setStatus] = useState(null);
  const [login, setLogin] = useState(null);
  const [telegram, setTelegram] = useState(null);
  const [password, setPassword] = useState(null);
  const [passwordConfirmation, setPasswordConfirmation] = useState(null);
  const alerts = withReactContent(Swal);
  const router = useRouter();
  const [invalidUsername, setInvalidUsername] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      login.indexOf(" ") > -1 ||
      login.indexOf("-") > -1 ||
      login.indexOf("@") > -1
    ) {
      return alerts.fire({
        icon: "error",
        text: "Invalid username. (Username ex.: Dev4nonymous)",
      });
    }

    if (passwordConfirmation != password) {
      return alerts.fire({
        icon: "error",
        text: "Wrong password confirmation",
      });
    }

    if (String(login).length < 5) {
      alerts.fire({
        icon: "error",
        text: "Username too short! Minimum is 5 characters.",
      });
      return;
    }

    const res = await axios.post("/api/users", {
      login,
      password,
      mail: telegram,
    });

    if (res.data.error) {
      alerts.fire({
        icon: "error",
        title: "Error!",
        text: res.data.error,
      });
    } else if (res.data.success) {
      alerts.fire({
        icon: "success",
        title: "Ready!",
        text: "Redirecting...",
        timer: 500,
      });

      window.localStorage.setItem("token", res.data.token);

      router.push("/dashboard");
    }
  }

  useEffect(() => {
    async function getStatus() {
      const res = await axios.get("/api/status");
      setStatus(res.data);
    }
    getStatus();
    async function checkLogin() {
      const res = await axios.get("/api/sessions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (!res.data.error) {
        router.push("/dashboard");
        return;
      }
    }
    function checkVersion() {
      if (!window.localStorage.getItem(versionData.versionCode)) {
        alerts.fire({
          icon: "info",
          title: "New version: " + versionData.versionCode + "!",
          text: versionData.updates,
        });
        window.localStorage.setItem(versionData.versionCode, "true");
      }
    }
    checkVersion();
    checkLogin();
  }, []);

  function handleUsernameVerification(value) {
    function isAlphaNumeric(str) {
      var code, i, len;

      for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (
          !(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)
        ) {
          // lower alpha (a-z)
          return false;
        }
      }
      return true;
    }

    setInvalidUsername(isAlphaNumeric(value) ? false : true);
  }

  return (
    <>
      <NextSeo
        title="checkercc - Free Sign Up"
        description="Create free account and earn free credits. Sign up now! CC Checker, Cvv Check, CC Shop."
        openGraph={{
          url: "https://www.checkercc.tech/",
          type: "website",
          locale: "en_US",
          title: "checkercc - Free Sign Up",
          description:
            "Create free account and earn free credits. Sign up now! CC Checker, Cvv Check, CC Shop.",
          siteName: "checkercc",
        }}
      />
      <Head>
        <title>checkercc | Register</title>
      </Head>
      <div className="root">
        <form onSubmit={handleSubmit} className="login">
          <h1 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <FontAwesomeIcon icon={faBarcode} />
            checker
            <b style={{ color: "#6b21a8" }}>cc</b>
          </h1>
          <h2>Sign up </h2>
          <label htmlFor="" style={{ margin: 0 }}>
            Username:
          </label>
          <input
            minLength={5}
            maxLength={16}
            onChange={(e) => {
              setLogin(e.target.value);
              handleUsernameVerification(e.target.value);
            }}
            type="text"
            name=""
            placeholder="username (ex: crazy8) *"
            id=""
            style={invalidUsername ? { border: "1px solid #d00505" } : {}}
          />
          {invalidUsername && (
            <small
              style={{ fontSize: "12px", color: "#d00505", marginTop: "-15px" }}
            >
              Please enter an alphanumeric username!
            </small>
          )}
          <label htmlFor="" style={{ margin: 0 }}>
            Telegram:
          </label>
          <input
            onChange={(e) => setTelegram(e.target.value)}
            type="text"
            name=""
            placeholder="@telegram_user"
            id=""
          />

          <label htmlFor="" style={{ margin: 0 }}>
            Password:
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name=""
            placeholder="password *"
            id=""
          />

          <label htmlFor="" style={{ margin: 0 }}>
            Confirm password:
          </label>
          <input
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            type="password"
            name=""
            placeholder="password confirmation *"
            id=""
          />
          <button>Create account</button>

          <div
            style={{ color: "#6b21a8", cursor: "pointer" }}
            onClick={() => router.push("/login")}
          >
            <FontAwesomeIcon icon={faArrowRight} /> Already registered? Log in
            here
          </div>

          {status && (
            <div style={{ opacity: 0.7 }}>
              <span>
                <b>Total users:</b> {status.totalUsers}
              </span>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
