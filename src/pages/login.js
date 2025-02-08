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
import Link from 'next/link';

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
        <title>SECCX.PRO | Login</title>
      </Head>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>
              <span className="gradient-text">SECCX.PRO</span>
            </h1>
            <p>Access your premium checker account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button">
              <FontAwesomeIcon icon={faRocket} />
              Launch Platform
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/signup">
                <a className="auth-link">Create Account</a>
              </Link>
            </p>
          </div>
        </div>

        {status && (
          <div style={{ opacity: 0.7, marginTop: "20px" }}>
            <span>
              <b>Total users:</b> {status.totalUsers}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 20px;
        }

        .auth-container {
          background: rgba(0,255,68,0.05);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(0,255,68,0.1);
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .gradient-text {
          font-size: 2.5rem;
          background: linear-gradient(45deg, #00ff44, #00cc44);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .auth-header p {
          color: #666;
          margin-top: 10px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #00ff44;
          font-size: 1.2rem;
        }

        input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border-radius: 12px;
          border: 1px solid #222;
          background: #111;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input:focus {
          outline: none;
          border-color: #00ff44;
          box-shadow: 0 0 20px rgba(0,255,68,0.1);
        }

        .auth-button {
          background: linear-gradient(45deg, #00ff44, #00cc44);
          color: #000;
          border: none;
          padding: 15px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .auth-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,255,68,0.2);
        }

        .auth-footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
        }

        .auth-link {
          color: #00ff44;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
