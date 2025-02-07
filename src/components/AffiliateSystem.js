import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake, faCopy, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AffiliateSystem({ user }) {
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    earnings: 0,
    activeReferrals: 0
  });

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://seccx.pro/ref/${user.referralCode}`);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Referral link copied to clipboard',
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <div className="affiliate-container">
      <div className="affiliate-header">
        <FontAwesomeIcon icon={faHandshake} className="header-icon" />
        <h2>Affiliate Program</h2>
      </div>

      <div className="affiliate-stats">
        <div className="stat-card">
          <div className="stat-value">{affiliateStats.totalReferrals}</div>
          <div className="stat-label">Total Referrals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${affiliateStats.earnings.toFixed(2)}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{affiliateStats.activeReferrals}</div>
          <div className="stat-label">Active Referrals</div>
        </div>
      </div>

      <div className="referral-link">
        <input 
          type="text" 
          value={`https://seccx.pro/ref/${user.referralCode}`} 
          readOnly 
        />
        <button onClick={copyReferralLink}>
          <FontAwesomeIcon icon={faCopy} /> Copy
        </button>
      </div>

      <style jsx>{`
        .affiliate-container {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          padding: 25px;
          margin: 20px 0;
        }

        .affiliate-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .header-icon {
          font-size: 24px;
          color: #6b21a8;
          filter: drop-shadow(0 0 8px rgba(107, 33, 168, 0.5));
        }

        .affiliate-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(107, 33, 168, 0.2);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.15);
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #888;
          font-size: 14px;
        }

        .referral-link {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .referral-link input {
          flex: 1;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid rgba(107, 33, 168, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
        }

        .referral-link button {
          padding: 12px 24px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .referral-link button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.2);
        }

        @media (max-width: 768px) {
          .affiliate-stats {
            grid-template-columns: 1fr;
          }

          .referral-link {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
} 
