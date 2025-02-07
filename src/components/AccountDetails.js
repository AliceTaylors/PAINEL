import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPersonBurst,
  faPersonCircleCheck,
  faWallet,
  faUser,
  faClock,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function AccountDetails({ user }) {
  const router = useRouter();
  const { t, lang } = useTranslation('dashboard');

  return (
    <div className="account-container">
      <div className="account-grid">
        <div className="account-card">
          <FontAwesomeIcon icon={faUser} className="card-icon" />
          <div className="card-content">
            <h3>Username</h3>
            <p>{user.login}</p>
          </div>
        </div>

        <div className="account-card">
          <FontAwesomeIcon icon={faWallet} className="card-icon" />
          <div className="card-content">
            <h3>Balance</h3>
            <p>${user.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="account-card">
          <FontAwesomeIcon icon={faClock} className="card-icon" />
          <div className="card-content">
            <h3>Member Since</h3>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="account-card">
          <FontAwesomeIcon icon={faShieldHalved} className="card-icon" />
          <div className="card-content">
            <h3>Status</h3>
            <p className="status-badge">{user.status || 'Active'}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-container {
          margin: 20px 0;
          padding: 20px;
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(107, 33, 168, 0.2);
        }

        .account-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .account-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          border-radius: 12px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          transition: all 0.3s ease;
        }

        .account-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.15);
        }

        .card-icon {
          font-size: 24px;
          color: #6b21a8;
          filter: drop-shadow(0 0 8px rgba(107, 33, 168, 0.5));
        }

        .card-content {
          flex: 1;
        }

        .card-content h3 {
          margin: 0;
          font-size: 14px;
          color: #888;
          margin-bottom: 5px;
        }

        .card-content p {
          margin: 0;
          font-size: 18px;
          color: #fff;
          font-weight: bold;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border-radius: 20px;
          font-size: 14px !important;
        }

        @media (max-width: 768px) {
          .account-card {
            padding: 15px;
          }

          .card-content p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
