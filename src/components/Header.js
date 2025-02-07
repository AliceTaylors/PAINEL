import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faBitcoinSign,
  faDollar,
  faPerson,
  faWallet,
  faGem,
  faHome,
  faShoppingCart,
  faGear,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Link from "next/link";
import axios from "axios";

export default function Header({ dashboard }) {
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUser = async () => {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      setUser(null);
      return;
    }

    setUser(res.data.user);
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    let index = 0;
    setInterval(() => {
      index = index + 1;
      getUser();
    }, 30000);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: faHome,
      path: "/dashboard"
    },
    {
      name: "Shop",
      icon: faShoppingCart,
      path: "/dashboard/shop"
    },
    {
      name: "Wallet",
      icon: faWallet,
      path: "/dashboard/wallet"
    },
    {
      name: "Affiliates",
      icon: faHandshake,
      path: "/dashboard/affiliates"
    },
    {
      name: "Settings",
      icon: faGear,
      path: "/dashboard/settings"
    }
  ];

  return (
    <div className="header-container">
      <div className="header-main">
        <h1 className="brand">
          <Link href="/">
            <a className="brand-link">
              <FontAwesomeIcon icon={faGem} className="brand-icon" />
              <span className="brand-text">SECCX.PRO</span>
            </a>
          </Link>
        </h1>

        {user && (
          <div className="wallet-info" onClick={() => router.push("/dashboard/wallet")}>
            <FontAwesomeIcon icon={faWallet} className="wallet-icon" />
            <FontAwesomeIcon icon={faDollar} className="dollar-icon" />
            <span className="balance">{user.balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <nav className="navigation">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.path)}
            className={router.pathname === item.path ? "active" : ""}
          >
            <FontAwesomeIcon icon={item.icon} /> {item.name}
          </button>
        ))}
      </nav>

      <style jsx>{`
        .header-container {
          padding: 20px;
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(107, 33, 168, 0.2);
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .brand {
          margin: 0;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-icon {
          color: #6b21a8;
          font-size: 24px;
          filter: drop-shadow(0 0 8px rgba(107, 33, 168, 0.5));
        }

        .brand-text {
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
          letter-spacing: 2px;
          font-size: 24px;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.2), rgba(71, 118, 230, 0.2));
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(107, 33, 168, 0.3);
        }

        .wallet-info:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.2);
        }

        .wallet-icon, .dollar-icon {
          color: #6b21a8;
        }

        .balance {
          color: #fff;
          font-weight: bold;
        }

        .navigation {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .navigation button {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(107, 33, 168, 0.3);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .navigation button:hover {
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.1);
        }

        .navigation button.active {
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.2);
        }

        @media (max-width: 768px) {
          .navigation {
            gap: 5px;
          }

          .navigation button {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
