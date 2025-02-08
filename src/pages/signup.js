import { useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faUser, 
  faEnvelope, 
  faGem,
  faAdd,
  faBarcode
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import { NextSeo } from "next-seo";
import versionData from "../version.json";

export default function Signup() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await axios.post('/api/users', {
      username: login,
      password,
      email: mail
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    router.push('/login');
  }

  return (
    <>
      <NextSeo
        title="CHECKERCC - Free Sign Up"
        description="Create free account and earn free credits. Sign up now! CC Checker, Cvv Check, CC Shop."
        openGraph={{
          url: "https://www.checkercc.site/",
          type: "website",
          locale: "en_US",
          title: "CHECKERCC - Free Sign Up",
          description:
            "Create free account and earn free credits. Sign up now! CC Checker, Cvv Check, CC Shop.",
          siteName: "CHECKERCC",
        }}
      />
      <Head>
        <title>SECCX.PRO | Create Account</title>
      </Head>

      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
              <FontAwesomeIcon icon={faBarcode} />
              <span className="gradient-text">SECCX.PRO</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                onChange={(e) => setMail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button">
              <FontAwesomeIcon icon={faAdd} /> Create Account
            </button>

            <div className="auth-footer" onClick={() => router.push("/login")}>
              Already have an account? Login
            </div>
          </form>
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
            width: min(90%, 450px);
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

          @media (max-width: 480px) {
            .input-group + .input-group {
              margin-top: 5px;
            }
          }

          @media (max-height: 600px) {
            .auth-container {
              padding: 15px;
            }
            
            .auth-form {
              gap: 12px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
