import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTelegram, faBell, faEnvelope, faShieldHalved, faGears, faLock, faClockRotateLeft, faHeadset } from '@fortawesome/free-solid-svg-icons';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/Settings.module.css";

export default function Settings() {
  const alerts = withReactContent(Swal);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telegram, setTelegram] = useState("");
  const [notifications, setNotifications] = useState({
    email: false,
    telegram: false,
    browser: false,
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!window.localStorage.getItem("token")) {
      router.push("/");
      return;
    }
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const res = await axios.get("/api/sessions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (res.data.error) {
        router.push("/");
        return;
      }

      setUser(res.data.user);
      setTelegram(res.data.user.telegram || "");
      setNotifications({
        email: res.data.user.notifications?.email || false,
        telegram: res.data.user.notifications?.telegram || false,
        browser: res.data.user.notifications?.browser || false,
      });
      setEmail(res.data.user.email || "");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alerts.fire({
        icon: "error",
        title: "Error",
        text: "New passwords don't match",
      });
      return;
    }

    try {
      const res = await axios.put(
        "/api/users/update",
        {
          currentPassword,
          newPassword,
          type: "password"
        },
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      if (res.data.error) {
        alerts.fire({
          icon: "error",
          title: "Error",
          text: res.data.error,
        });
        return;
      }

      alerts.fire({
        icon: "success",
        title: "Success",
        text: "Password updated successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alerts.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to update password",
      });
    }
  };

  const handleTelegramUpdate = async (e) => {
    e.preventDefault();
    
    if (!telegram) {
      alerts.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a Telegram username",
      });
      return;
    }

    try {
      const res = await axios.put(
        "/api/users/update",
        {
          telegram,
          type: "telegram"
        },
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      if (res.data.error) {
        alerts.fire({
          icon: "error",
          title: "Error",
          text: res.data.error,
        });
        return;
      }

      alerts.fire({
        icon: "success",
        title: "Success",
        text: "Telegram username updated successfully",
      });

      // Update user state
      setUser(prev => ({
        ...prev,
        telegram
      }));

    } catch (error) {
      alerts.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to update Telegram username",
      });
    }
  };

  const handleNotificationChange = async (type) => {
    try {
      const newNotifications = {
        ...notifications,
        [type]: !notifications[type],
      };

      const res = await axios.put(
        "/api/users/update",
        { 
          notifications: newNotifications,
          type: "notifications"
        },
        {
          headers: { token: window.localStorage.getItem("token") },
        }
      );

      if (res.data.error) {
        alerts.fire({
          icon: "error",
          title: "Error",
          text: res.data.error,
        });
        return;
      }

      setNotifications(newNotifications);
      
      // Update user state
      setUser(prev => ({
        ...prev,
        notifications: newNotifications
      }));

    } catch (error) {
      alerts.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to update notifications",
      });
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/update-email', {
        email
      }, {
        headers: { token: window.localStorage.getItem('token') }
      });

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Email updated successfully'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update email'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupportClick = () => {
    window.open('https://t.me/DEV4NONYMOUS', '_blank');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>SECCX.PRO | Settings</title>
        <meta name="description" content="SECCX.PRO - Premium Card Checker Settings" />
      </Head>

      <Header />

      <div className="settings-container">
        <div className="settings-grid">
          <div className="settings-card">
            <h3><FontAwesomeIcon icon={faKey} /> Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                Update Password
              </button>
            </form>
          </div>

          <div className="settings-card">
            <h3><FontAwesomeIcon icon={faEnvelope} /> Update Email</h3>
            <form onSubmit={handleUpdateEmail}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                Update Email
              </button>
            </form>
          </div>

          <div className="settings-card support">
            <h3>
              <FontAwesomeIcon icon={faHeadset} /> Support
            </h3>
            
            <div className="support-content">
              <div className="support-info">
                <p>Need help? Contact our support team on Telegram!</p>
                <p>We're available 24/7 to assist you with any questions or issues.</p>
              </div>

              <div className="support-actions">
                <button onClick={handleSupportClick} className="telegram-btn">
                  <FontAwesomeIcon icon={faTelegram} />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .settings-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .settings-card {
          background: #1a1a1a;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #333;
        }

        h2 {
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        h3 {
          color: #fff;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        input {
          padding: 12px;
          background: #111;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
        }

        button {
          padding: 12px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border: none;
          border-radius: 6px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.4);
        }

        .support-content {
          background: #111;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .support-info {
          text-align: center;
          color: #fff;
          margin-bottom: 20px;
        }

        .support-info p {
          margin: 10px 0;
          color: #888;
        }

        .support-actions {
          display: flex;
          justify-content: center;
        }

        .telegram-btn {
          padding: 15px 30px;
          background: linear-gradient(45deg, #0088cc, #0099ff);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
        }

        .telegram-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 136, 204, 0.4);
        }

        .telegram-btn svg {
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
