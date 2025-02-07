import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faTrash,
  faCreditCard,
  faBitcoinSign,
  faCartShopping,
  faKey,
  faDatabase,
  faCartPlus,
  faPersonCircleCheck,
  faFire,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import Image from "next/image";
import versionData from "../../version.json";
import checkerSettings from "../../checkerSettings";
import Header from "../../components/Header";
import AccountDetails from "../../components/AccountDetails";
import Footer from "../../components/Footer";

export default function Settings() {
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUser = async () => {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
    }

    setUser(res.data.user);
  };

  useEffect(() => {
    getUser();
  }, []);

  async function handleLogout() {
    alerts
      .fire({
        icon: "warning",
        title: "Attention",
        text: "Sure you want to logout?",
        showCancelButton: true,
        confirmButtonText: "Logout",
      })
      .then((e) => {
        if (e.isConfirmed) {
          window.localStorage.removeItem("token");
          router.push("/");
        }
      });
  }

  return (
    <>
      <Head>
        <title>CHECKERCC | Settings & Terms </title>
      </Head>
      {user && (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />

          <AccountDetails user={user} />

          <div>
            <h2>Settings</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <br />

          <div>
            <h2>Terms of service</h2>
          </div>
          <div style={{ opacity: 0.5 }}>
            <div>
              <b style={{ fontSize: "24px" }}> 1. Use</b>
              <br /> The tool is available for use according to the users
              responsibility. We are not responsible for the actions of users.
              The tool is just a technology developed by us!
            </div>
            <br />
            <div>
              <b style={{ fontSize: "24px" }}> 2. Chargebacks</b>
              <br /> We do not refund the added balance, please only add the
              balance that you will actually use on the platform.
            </div>
            <br />
            <div>
              <b style={{ fontSize: "24px" }}> 3. Privacy</b>
              <br /> We dont collect your data.
            </div>
          </div>

          <br />

          <Footer />
        </div>
      )}
    </>
  );
}
