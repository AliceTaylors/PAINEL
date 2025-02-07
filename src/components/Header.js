import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faBitcoinSign,
  faDollar,
  faPerson,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

import axios from "axios";
export default function Header({ dashboard }) {
  const alerts = withReactContent(Swal);

  const [user, setUser] = useState(null);

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

  const router = useRouter();
  return (
    <div>
      <div className="header" style={{ alignItems: "center" }}>
        <h1
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          <FontAwesomeIcon icon={faBarcode} />
          checker
          <b
            className="title-highlight"
            style={{ color: "#6b21a8 !important" }}
          >
           cc
          </b>
          
        </h1>

        {user && (
          <span
            onClick={() => {
              router.push("/dashboard/wallet");
            }}
            style={{
              background: "linear-gradient(to left, #6b21a8, #111)",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon style={{ marginLeft: "5px" }} icon={faWallet} />{" "}
            {""}{" "}
            <FontAwesomeIcon style={{ marginLeft: "5px" }} icon={faDollar} />
            {user && user.balance.toFixed(2)}
          </span>
        )}
      </div>

      <div className="menu-header">
        <button onClick={() => Router.push("/dashboard")}>Checker</button>
        <button onClick={() => Router.push("/dashboard/shop")}>Shop</button>
        <button onClick={() => Router.push("/dashboard/wallet")}>Wallet</button>
        <button onClick={() => Router.push("/dashboard/api")}>API Docs</button>
        <button onClick={() => Router.push("/dashboard/settings")}>
          Settings
        </button>
      </div>
    </div>
  );
}
