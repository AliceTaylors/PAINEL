import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function Controlador({}) {
  const [data, setData] = useState(null);
  const router = useRouter();
  const alerts = withReactContent(Swal);
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [cards, setCards] = useState("");

  useEffect(() => {
    if (!window.localStorage.getItem("token")) {
      return router.push("/");
    }

    async function getUser() {
      const res = await axios.get("/api/sessions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (!res.data.user) return router.push("/dashboard");

      if (!res.data.user.admin) return router.push("/dashboard");

      setUser(res.data.user);
    }

    async function getData() {
      getUser();

      const res = await axios.get("/api/administration/logs", {
        headers: { token: window.localStorage.getItem("token") },
      });

      console.log(res.data);

      setData(res.data);
    }
    getData();
  }, []);

  function getLogColor(logText) {
    if (logText.includes("PAID ORDER")) {
      return "greenyellow";
    } else if (logText.includes("NEW ORDER")) {
      return "yellow";
    } else if (logText.includes("CANCEL ORDER")) {
      return "tomato";
    } else if (logText.includes("NEW USER")) {
      return "deepskyblue";
    } else {
      return "white";
    }
  }

  async function setUserBalance() {
    const res = await axios.post(
      "/api/administration/funds",
      { username, amount },
      { headers: { token: window.localStorage.getItem("token") } }
    );

    if (res.data.error) {
      return alerts.fire({ text: res.data.error });
    }

    alerts.fire({
      icon: "success",
      text: `Success! Added ${parseFloat(amount).toFixed(2)}$ to ${username}.`,
    });

    setUsername("");
    setAmount("");
  }

  async function addCards() {
    const res = await axios.post(
      "/api/administration/cards",
      { cards },
      { headers: { token: window.localStorage.getItem("token") } }
    );

    if (res.data.error) {
      return alerts.fire({ text: res.data.error });
    }

    alerts.fire({
      icon: "success",
      text: `Success! Added ${cards.split("\n").length} CCs.`,
    });

    setCards("");
  }

  return (
    user && (
      <div
        className="root"
        style={{
          display: "flex",
          marginTop: "10px",
          marginBottom: "20px",
          flexDirection: "column",
        }}
      >
        <title>Administration | Checker</title>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>⚙️ Administration</h1>
          <Link href="/administration/lives">
            <button
              style={{
                display: "flex",
                background: "#222",
                alignItems: "center",
                gap: "5px",
              }}
            >
              Live CCs <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            flexDirection: "column",
            gap: "5px",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span style={{ marginBottom: "5px", fontWeight: "bold" }}>
            💳 Add CC list {"(SHOP)"}
          </span>

          <textarea
            placeholder="CC|MM|YYYY|CVV"
            value={cards}
            onChange={(e) => setCards(e.target.value)}
          />

          <button onClick={addCards}>Add CCS +</button>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            flexDirection: "column",
            gap: "5px",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span style={{ marginBottom: "5px", fontWeight: "bold" }}>
            💰 Add funds
          </span>
          <span>Username:</span>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span>Amount:</span>
          <input
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={setUserBalance}>Add funds +</button>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            flexDirection: "column",
            gap: "5px",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span style={{ marginBottom: "5px", fontWeight: "bold" }}>
            ⏰ Recent Logs
          </span>
          <table
            style={{
              width: "100% !important",
              background: "#111",
              borderRadius: "5px",
              padding: "10px",
            }}
          >
            <thead style={{ fontSize: "25px", fontWeight: "bolder" }}>
              <tr>
                <th>Data</th>
                <th>Log</th>
              </tr>
            </thead>
            <tbody>
              {user &&
                data &&
                data.logs &&
                data.logs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.date}</td>
                    <td style={{ color: getLogColor(log.log) }}>{log.log}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
}
