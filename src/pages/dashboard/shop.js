import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/router";
import ReactLoading from "react-loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCartShopping,
  faKey,
  faDatabase,
  faCartPlus,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import Image from "next/image";
import versionData from "../../version.json";
import Header from "../../components/Header";
import AccountDetails from "../../components/AccountDetails";
import Footer from "../../components/Footer";
import useTranslation from "next-translate/useTranslation";

export default function Painel() {
  const { t, lang } = useTranslation("dashboard");

  const [cardColors] = useState([
    "#6b21a8",
    "#8E54E9",
    "#4776E6",
    "#FF8008",
    "#F45C43",
    "#1D976C",
  ]);
  const [searchingText, setSearchingText] = useState("Searching...");
  const [cards, setCards] = useState([]);
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getRandomColor = () => {
    return (
      "linear-gradient(to left, " +
      cardColors[Math.floor(Math.random() * cardColors.length)] +
      ", #111)"
    );
  };

  const getUser = async () => {
    const res = await axios.get("/api/sessions", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
    }

    setUser(res.data.user);
  };
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  const getData = async () => {
    const res = await axios.get("/api/cards", {
      headers: { token: window.localStorage.getItem("token") },
    });

    if (res.data.error) {
      router.push("/");
    }

    const cardsWithColors = [];
    res.data.map((card) => {
      cardsWithColors.push({ ...card, color: getRandomColor() });
    });

    setCards(shuffle(cardsWithColors));
  };

  useEffect(() => {
    getUser();
    getData();
  }, []);

  useEffect(() => {
    function checkVersion() {
      if (!window.localStorage.getItem(versionData.versionCode)) {
        alerts.fire({
          icon: "info",
          title: "New version: " + versionData.versionCode + "!",
          html: versionData.updates,
        });
        window.localStorage.setItem(versionData.versionCode, "true");
      }
    }
    checkVersion();
  }, []);

  async function handleSearch(e) {
    setSearchingText("Searching...");
    setCards([]);
    const id = setTimeout(async () => {
      const res = await axios.get(
        "/api/cards?q=" + encodeURIComponent(e.target.value),

        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      if (cards.length < 1) {
      }

      const cardsWithColors = [];
      res.data.map((card) => {
        cardsWithColors.push({ ...card, color: getRandomColor() });
      });

      setCards(shuffle(cardsWithColors));
      setTimeout(() => {
        if (res.data.length < 1) {
          setSearchingText("Not found!");
        }
      }, 2000);
    }, 2000);
  }

  async function handleBuyCard(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { cardId } = Object.fromEntries(formData);

    const res = await axios.post(
      "/api/cards",
      { id: cardId },
      {
        headers: { token: window.localStorage.getItem("token") },
      }
    );

    if (res.data.error) {
      return alerts
        .fire({
          icon: "warning",
          showCancelButton: true,
          html: res.data.error,
          cancelButtonText: "Cancel",
          confirmButtonText: "Charge",
        })
        .then((res) => {
          if (res.isConfirmed) return router.push("/dashboard/wallet");
        });
    }
    getData();
    getUser();

    alerts.fire({
      icon: "success",
      html: `<b>PURCHASED CARD: </b><br/> <b>NUMBER:</b> ${res.data.card.number}<br/><b>DETAILS:</b> ${res.data.card.data}<br/><b>PIN:</b> ${res.data.card.pin}<br/>${res.data.card.bin}<br/>PRICE: $${res.data.card.price}`,
    });
  }

  return (
    <>
      <Head>
        <title>checkercc | CC Shop</title>
      </Head>
      {user ? (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />
          <div
            className="warns"
            style={{ fontSize: "15px", letterSpacing: 1.05 }}
          >
            <div
              onClick={() => {
                router.push("/dashboard/wallet");
              }}
              style={{
                color: "#f5f5f5",
                background: "linear-gradient(to left, greenyellow, #111)",
              }}
            >
              {t("promotion")}
            </div>
          </div>

          <br />
          <AccountDetails user={user} />

          <div className="checker products" style={{ marginBottom: "30px" }}>
            <h2>
              {" "}
              <span>
                <FontAwesomeIcon icon={faCartShopping} /> CC SHOP{" "}
              </span>
              <div>
                <small
                  style={{
                    fontSize: "12px",
                    letterSpacing: 1,
                    background: "greenyellow",
                    color: "black",
                    marginLeft: "10px",
                    padding: "1px 2px",
                    borderRadius: "5px",
                  }}
                >
                  High quality databases
                </small>
              </div>
            </h2>

            {cards && (
              <div
                className="checker products-list"
                style={{
                  fontSize: "13px",
                  fontWeight: "bolder",
                  display: "flex",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <form
                    className="search"
                    action=""
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div>
                      <span>{t("searchbykeyword")}:</span>
                    </div>
                    <div>
                      <input
                        onChange={handleSearch}
                        placeholder="Search (Ex: #US, #MX, platinum)"
                        type="text"
                        name=""
                        id=""
                      />
                    </div>
                    <div></div>
                  </form>
                </div>
                {cards.length < 1 && <form>{searchingText}</form>}
                {cards.map((card) => (
                  <div className="cardDiv" key={card._id}>
                    <form style={{}} onSubmit={handleBuyCard}>
                      <input type="hidden" name="cardId" value={card._id} />{" "}
                      <Image
                        width="40px"
                        alt="card brand"
                        height={card.number.slice(0, 1) == 4 ? "20px" : "30px"}
                        src={"/cards/" + card.number.slice(0, 1) + ".png"}
                      />
                      <span>
                        {/*3746327570804757|02|2025|9219 / AMERICAN EXPRESS / CREDIT REWARDS / BANK OF AMERICA UNITED STATES*/}
                        <FontAwesomeIcon icon={faCreditCard} /> {card.number}{" "}
                        {card.data}
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faDatabase} /> {card.bin} (Database: HQ-FEBRUARY-18-2024.CSV
)
                      </span>
                      <button
                        style={{
                          fontWeight: "normal",
                          fontSize: "17px",
                          background: "#000 !important",
                        }}
                        type="submit"
                      >
                        <FontAwesomeIcon icon={faCartPlus} /> / $
                        {parseFloat(card.price).toFixed(2)}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Footer />
        </div>
      ) : (
        <ReactLoading
          style={{ margin: "auto" }}
          type={"spinningBubbles"}
          color={"#f5f5f5"}
          height={200}
          width={100}
        />
      )}
    </>
  );
}
