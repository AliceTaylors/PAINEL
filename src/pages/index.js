import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBarcode,
  faCheck,
  faEarth,
  faLock,
  faMessage,
  faPerson,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { NextSeo } from 'next-seo';
import { useEffect } from 'react';
import versionData from '../version.json';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Link from 'next/link';
import axios from 'axios';
import Head from 'next/head';
export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState(null);
  const alerts = withReactContent(Swal);

  async function getUser() {
    const res = await axios.get('/api/sessions', {
      headers: { token: window.localStorage.getItem('token') },
    });

    if (res.data.error) {
      setUser(null);
      return;
    }

    setUser(res.data.user || null);
  }

  function checkVersion() {
    if (!window.localStorage.getItem(versionData.versionCode)) {
      alerts.fire({
        icon: 'info',
        title: 'New version: ' + versionData.versionCode + '!',
        html: versionData.updates,
      });
      window.localStorage.setItem(versionData.versionCode, 'true');
    }
  }
  function checkSSL() {
    if (
      window.location.protocol == 'http:' &&
      window.location.host != 'localhost:3000' &&
      window.location.host != '127.0.0.1:3000' &&
      window.location.host.indexOf('192.168.0.') < 0
    ) {
      router.push(
        window.location.href
          .replace('http:', 'https:')
          .replace('herokupp.com', '.tech')
          .replace('vercel.app', '.tech')
      );
    }
  }

  useEffect(() => {
    async function getStatus() {
      const res = await axios.get('/api/status');
      setStatus(res.data);
    }
    getStatus();
    checkSSL();
    checkVersion();
    getUser();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);
  return (
    <div className="root">
      <Particles
        id="tsparticles"
        options={{
          background: {
            color: {
              value: 'transparent',
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#f5f5f5',
            },
            links: {
              color: '#f5f5f5',
              distance: 150,
              enable: true,
              opacity: 0.0,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 10000,
              },
              value: 50,
            },
            opacity: {
              value: 0.1,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
        init={particlesInit}
        loaded={particlesLoaded}
      />
      <NextSeo
        title="CHECKERCC.SITE - CC CHECKER, CCN/CVV SHOP & CARDING TECHNOLOGY."
        description="Best CC Checker of World. We Develop edge carding technology! CVV Checker & Shop 24/7"
        openGraph={{
          url: 'https://www.checkercc.site',
          type: 'website',
          locale: 'en_US',
          images: [
            {
              url: 'https://www.checkercc.site/og-image.png',
              width: 800,
              height: 600,
              alt: 'Og Image Alt',
            },
          ],
          title: 'CHECKERCC.SITE - CC CHECKER & CVV DUMP SHOP',
          description: 'BEST CC CHECKER, DUMP SHOP & CARDING STUFFS. ',
          siteName: 'CHECKERCC.SITE CC Checker & Shop',
        }}
      />
      <div className="header" style={{ padding: '20px' }}>
        <h1 style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <FontAwesomeIcon icon={faBarcode} />
          checker
          <b style={{ color: '#6b21a8' }}>cc</b>
          <small> </small>
        </h1>
        {!user ? (
          <Link href="/login">
            <button>Login</button>
          </Link>
        ) : (
          <Link href="/dashboard">
            <button>
              Panel <FontAwesomeIcon icon={faUser} />
            </button>
          </Link>
        )}
      </div>

      <div
        className="slogan"
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space',
          alignItems: 'center',
        }}
      >
        <Image src={'/illustration1.svg'} width={'350px'} height={'350px'} />
        <div style={{}}>
          <h1 style={{ fontSize: '38px', maxWidth: '428px' }}>
           Fast CC Checker & Shop!
          </h1>
          <div
            className="signup-action"
            style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}
          >
            <button
              style={{}}
              onClick={() => {
                router.push('/signup');
              }}
            >
              Get started <FontAwesomeIcon icon={faArrowRight} />{' '}
            </button>
            <div>
              <small
                style={{
                  background: 'greenyellow',
                  borderRadius: '8px',
                  color: '#111',
                  padding: '3px 2px',
                  fontSize: '12px',
                  opacity: 0.8,
                  letterSpacing: 1.5,
                }}
              >
                + Earn 1 USD free credit
              </small>
            </div>
          </div>
          <br />
        </div>
      </div>

      <div
        className="website-details"
        style={{
          justifyContent: 'center',
          gap: '20px',
          display: 'flex',
          flexDirection: 'row',
          maxWidth: '80%',
          margin: 'auto',
          marginTop: '100px',
        }}
      >
        <img
          style={{
            height: '300px',
          }}
          src="/site-screenshot.png"
          alt="CHECKERCC Dashboard Screenshot"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3
            style={{
              fontSize: '32px',
              lineHeight: '30px',
            }}
          >
            Enjoy our products :)
          </h3>
          <ul style={{ marginTop: 0 }}>
            <li>Fast CC Checker</li>
            <li>Fresh CC Shop</li>
            <li>No e-mail needed</li>
            <li>No IP registration</li>
            <li>Crypto-Payments available</li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/signup">
              <button
                style={{
                  background: 'greenyellow',
                  fontSize: '18px',
                  padding: '5px',
                  color: '#111',
                }}
              >
                Create new account
              </button>
            </Link>
            <span style={{ textAlign: 'center' }}>or</span>
            <Link href="/login">
              <button
                style={{
                  background: '#111',
                  fontSize: '18px',
                  padding: '5px',
                  color: '#f5f5f5',
                }}
              >
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="main" style={{ marginTop: '100px' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ textTransform: 'uppercase' }}>WHY WE ARE THE BEST?</h3>
          <span style={{ opacity: '0.5' }}>
            All of our products are thought of the customer and the evolution of
            the community!
          </span>
        </div>

        <div className="cards home-cards">
          <div>
            <div>
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div style={{ fontWeight: 'bold' }}>
              CHECK CARDS
            </div>
            <div>Best checkers of world!</div>
          </div>
         

          <div>
            <div>
              <FontAwesomeIcon icon={faPerson} />
            </div>
            <div style={{ fontWeight: 'bold' }}>
              {status && status.totalUsers} USERS
            </div>
            <div>Already created an account and availed our services!</div>
          </div>
        </div>

        <div style={{ marginTop: '70px', marginBottom: '20px', opacity: 0.4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => {
                router.push('https://t.me/CHECKERCC');
              }}
              style={{ padding: '8px', fontSize: '14px' }}
            >
              <FontAwesomeIcon icon={faMessage} /> Join Telegram Chat
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span>checkercc.tech @ 2022~{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
