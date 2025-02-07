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

// Adicione este objeto com as URLs das imagens
const CARD_BRAND_IMAGES = {
  visa: 'https://cdn.iconscout.com/icon/free/png-256/visa-3-226460.png',
  mastercard: 'https://cdn.iconscout.com/icon/free/png-256/mastercard-3-226462.png',
  amex: 'https://cdn.iconscout.com/icon/free/png-256/american-express-3-226461.png',
  discover: 'https://cdn.iconscout.com/icon/free/png-256/discover-3-226463.png',
  diners: 'https://cdn.iconscout.com/icon/free/png-256/diners-club-3-226464.png',
  jcb: 'https://cdn.iconscout.com/icon/free/png-256/jcb-3-226465.png',
  generic: 'https://cdn.iconscout.com/icon/free/png-256/credit-card-6-226466.png'
};

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
    
    try {
      const searchTerm = e.target.value.toLowerCase();
      const res = await axios.get(
        "/api/cards?q=" + encodeURIComponent(searchTerm),
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      const cardsWithColors = res.data.map(card => ({
        ...card,
        color: getRandomColor()
      }));

      setCards(shuffle(cardsWithColors));
      
      if (cardsWithColors.length === 0) {
        setSearchingText("Not found!");
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchingText("Error searching cards");
    }
  }

  // Função para gerar preço baseado no nível do cartão
  const getPriceByLevel = (level) => {
    const levels = {
      'CLASSIC': { min: 12, max: 25 },
      'GOLD': { min: 25, max: 50 },
      'PLATINUM': { min: 50, max: 75 },
      'INFINITE': { min: 75, max: 100 },
      'BLACK': { min: 85, max: 100 }
    };
    
    const cardLevel = level.toUpperCase();
    const priceRange = levels[cardLevel] || levels.CLASSIC;
    
    return Number((Math.random() * (priceRange.max - priceRange.min) + priceRange.min).toFixed(2));
  };

  // Função simplificada para gerar PIN aleatório (4 dígitos numéricos)
  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Função simplificada para verificar cartão
  const checkCard = async (cc) => {
    try {
      const check = await axios.post(
        '/api/checks',
        { cc },
        { headers: { token: window.localStorage.getItem('token') } }
      );
      return check.data;
    } catch (error) {
      console.error('Error checking card:', error);
      return { success: false };
    }
  };

  // Função para identificar a bandeira do cartão
  const getCardBrand = (number) => {
    // Visa
    if (number.startsWith('4')) return 'visa';
    // Mastercard
    if (/^5[1-5]/.test(number)) return 'mastercard';
    // Amex
    if (/^3[47]/.test(number)) return 'amex';
    // Discover
    if (/^(6011|64[4-9]|65)/.test(number)) return 'discover';
    // Diners
    if (/^(30[0-5]|36|38)/.test(number)) return 'diners';
    // JCB
    if (/^(2131|1800|35)/.test(number)) return 'jcb';
    
    return 'generic';
  };

  // Função de compra atualizada
  async function handleBuyCard(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cardId = formData.get('cardId');

    try {
      // Mostra loading
      alerts.fire({
        title: 'Processing...',
        html: 'Please wait while we process your purchase...',
        allowOutsideClick: false,
        didOpen: () => {
          alerts.showLoading();
        }
      });

      // Faz a requisição de compra
      const res = await axios.post(
        "/api/cards",
        { id: cardId },
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      alerts.close();

      if (res.data.error) {
        return alerts.fire({
          icon: "warning",
          showCancelButton: true,
          html: res.data.error,
          cancelButtonText: "Cancel",
          confirmButtonText: "Charge",
        }).then((result) => {
          if (result.isConfirmed) return router.push("/dashboard/wallet");
        });
      }

      // Atualiza os dados
      getData();
      getUser();

      // Mostra sucesso
      alerts.fire({
        icon: "success",
        html: `<b>PURCHASED CARD:</b><br/>
              <b>NUMBER:</b> ${res.data.card.number}<br/>
              <b>DETAILS:</b> ${res.data.card.data}<br/>
              <b>PIN:</b> ${res.data.card.pin || generatePin()}<br/>
              <b>BIN:</b> ${res.data.card.bin}<br/>
              <b>PRICE:</b> $${res.data.card.price}`,
      });

    } catch (error) {
      alerts.close();
      alerts.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while processing your purchase."
      });
      console.error('Purchase error:', error);
    }
  }

  return (
    <>
      <Head>
        <title>SECCX.PRO | CC Shop</title>
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
            <h2 style={{
              background: 'linear-gradient(45deg, #6b21a8, #4776E6)',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FontAwesomeIcon icon={faCartShopping} style={{
                  fontSize: '24px',
                  color: '#fff'
                }} /> 
                Premium Card Shop
              </span>
              <div>
                <small style={{
                  fontSize: '12px',
                  letterSpacing: 1,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
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
                    <form onSubmit={handleBuyCard}>
                      <input type="hidden" name="cardId" value={card._id} />
                      <Image
                        width="40px"
                        height="30px"
                        alt="card brand"
                        src={CARD_BRAND_IMAGES[getCardBrand(card.number)]}
                        unoptimized={true}
                      />
                      <span>
                        <FontAwesomeIcon icon={faCreditCard} /> {card.number} {card.data}
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faDatabase} /> {card.bin}
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faKey} /> PIN: {card.pin || generatePin()}
                      </span>
                      <button
                        style={{
                          fontWeight: "normal",
                          fontSize: "17px",
                          background: "#000 !important",
                        }}
                        type="submit"
                      >
                        <FontAwesomeIcon icon={faCartPlus} /> / ${card.price}
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
