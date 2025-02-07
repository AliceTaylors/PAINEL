import { faAdd, faBarcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import versionData from "../version.json";
import { NextSeo } from "next-seo";

export default function Login() {
  const [login, setLogin] = useState(null);
  const [password, setPassword] = useState(null);
  const alerts = withReactContent(Swal);
  const router = useRouter();
  const [status, setStatus] = useState(null);

  useEffect(() => {
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
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await axios.post("/api/sessions", {
      login,
      password,
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

  return (
    <>
      <NextSeo
        title="checkercc | Login"
        description="checkercc | Checker, Shop | Login"
        openGraph={{
          url: "https://www.checkercc.site/",
          type: "website",
          locale: "en_US",
          title: "checkercc | Login",
          description: "Sign in on checkercc now! ",
          siteName: "CHECKERCC",
        }}
      />
      <Head>
        <title>checkercc | Login</title>
      </Head>
      <div className="root">
        <form onSubmit={handleSubmit} className="login">
          <h1 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <FontAwesomeIcon icon={faBarcode} />
            checker
            <b style={{ color: "#6b21a8" }}>cc</b>
          </h1>

          <label style={{ margin: 0 }}>Username: </label>
          <input
            onChange={(e) => setLogin(e.target.value)}
            type="text"
            name=""
            placeholder="username"
            id=""
          />

          <label style={{ margin: 0 }}>Password: </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name=""
            placeholder="****"
            id=""
          />
          <button>Log in </button>

          <div
            style={{ color: "#6b21a8", cursor: "pointer", marginTop: "10px" }}
            onClick={() => router.push("/signup")}
          >
            <FontAwesomeIcon icon={faAdd} /> Create new account{" "}
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
