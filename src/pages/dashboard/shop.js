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
  faSearch,
  faShieldHalved,
  faGem,
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
    return cardColors[Math.floor(Math.random() * cardColors.length)];
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

    const cardsWithColors = res.data.map((card) => ({
      ...card,
      color: getRandomColor()
    }));

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

  const handleSearch = async (e) => {
    setSearchingText("Searching...");
    setCards([]);

    const searchValue = e.target.value.trim();
    
    if (!searchValue) {
      getData();
      return;
    }

    try {
      const res = await axios.get(
        "/api/cards?q=" + encodeURIComponent(searchValue),
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      if (res.data && Array.isArray(res.data)) {
        if (res.data.length === 0) {
          setSearchingText("No cards found!");
          setCards([]);
        } else {
          const cardsWithColors = res.data.map((card) => ({
            ...card,
            color: getRandomColor()
          }));
          setCards(shuffle(cardsWithColors));
          setSearchingText("Searching...");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchingText("Error searching cards");
      setCards([]);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = debounce(handleSearch, 500);

  const handleBuyCard = async (e) => {
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
      html: `
        <div style="background:#111; padding:20px; border-radius:10px; margin-bottom:20px">
          <h3 style="color:#00ff00; margin-bottom:15px">Card Purchased Successfully!</h3>
          <div style="text-align:left; color:#fff">
            <p><b>Number:</b> ${res.data.card.number}</p>
            <p><b>Details:</b> ${res.data.card.data}</p>
            <p><b>PIN:</b> ${res.data.card.pin}</p>
            <p><b>BIN:</b> ${res.data.card.bin}</p>
            <p><b>Price:</b> $${res.data.card.price}</p>
          </div>
        </div>
      `,
      background: '#000',
      confirmButtonColor: '#00ff00'
    });
  };

  return (
    <>
      <Head>
        <title>SECCX.PRO | Premium Card Shop</title>
      </Head>
      {user ? (
        <div className="root" style={{ width: "80%" }}>
          <Header user={user} />

          <div className="shop-hero" style={{
            background: 'linear-gradient(45deg, #000, #111)',
            padding: '40px',
            borderRadius: '20px',
            marginBottom: '30px',
            border: '1px solid #222'
          }}>
            <h1 style={{
              fontSize: '2.5em',
              color: '#00ff00',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <FontAwesomeIcon icon={faGem} />
              Premium Card Shop
            </h1>
            <p style={{
              color: '#888',
              fontSize: '1.1em',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              Access our exclusive collection of high-quality cards. All cards are verified and tested before listing.
            </p>
          </div>

          <AccountDetails user={user} />

          <div className="shop-features" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            margin: '30px 0'
          }}>
            {[
              { icon: faShieldHalved, title: 'Verified Cards', desc: 'All cards are tested before listing' },
              { icon: faDatabase, title: 'Fresh Database', desc: 'Updated daily with new cards' },
              { icon: faFire, title: 'High Success Rate', desc: '95%+ success rate guaranteed' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: '#111',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #222'
              }}>
                <FontAwesomeIcon icon={feature.icon} style={{ 
                  color: '#00ff00',
                  fontSize: '24px',
                  marginBottom: '15px'
                }} />
                <h3 style={{ color: '#fff', marginBottom: '10px' }}>{feature.title}</h3>
                <p style={{ color: '#888' }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="shop-section" style={{
            background: '#111',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid #222'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{
                color: '#00ff00',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FontAwesomeIcon icon={faCartShopping} />
                Available Cards
              </h2>
              <div style={{
                position: 'relative',
                width: '300px'
              }}>
                <FontAwesomeIcon icon={faSearch} style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} />
                <input
                  onChange={debouncedSearch}
                  placeholder="Search cards (e.g. #US, platinum)"
                  style={{
                    width: '100%',
                    padding: '12px 15px 12px 45px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div className="cards-grid" style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
              {cards.length < 1 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666',
                  gridColumn: '1/-1'
                }}>
                  {searchingText}
                </div>
              )}

              {cards.map((card) => (
                <div key={card._id} style={{
                  background: '#0a0a0a',
                  borderRadius: '15px',
                  border: '1px solid #222',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  ':hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <div style={{
                    background: card.color,
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <Image
                      width="50"
                      height={card.number.slice(0, 1) == 4 ? "25" : "35"}
                      alt="card brand"
                      src={"/cards/" + card.number.slice(0, 1) + ".png"}
                      style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }}
                    />
                    <div>
                      <h3 style={{ 
                        color: '#fff',
                        fontSize: '1.2em',
                        marginBottom: '5px'
                      }}>
                        {card.number}
                      </h3>
                      <p style={{ color: '#eee', fontSize: '0.9em' }}>
                        {card.data}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{
                      color: '#888',
                      fontSize: '0.9em',
                      marginBottom: '15px'
                    }}>
                      <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '8px' }} />
                      {card.bin}
                    </div>

                    <form onSubmit={handleBuyCard} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <input type="hidden" name="cardId" value={card._id} />
                      <span style={{
                        color: '#00ff00',
                        fontSize: '1.2em',
                        fontWeight: 'bold'
                      }}>
                        ${parseFloat(card.price).toFixed(2)}
                      </span>
                      <button type="submit" style={{
                        background: '#00ff00',
                        color: '#000',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}>
                        <FontAwesomeIcon icon={faCartPlus} />
                        Buy Now
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Footer />
        </div>
      ) : (
        <ReactLoading
          style={{ margin: "auto" }}
          type={"spinningBubbles"}
          color={"#00ff00"}
          height={200}
          width={100}
        />
      )}
    </>
  );
}
