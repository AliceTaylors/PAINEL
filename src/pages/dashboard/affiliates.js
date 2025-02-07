import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandshake,
  faChartLine,
  faCopy,
  faUsers,
  faMoneyBillTrendUp,
  faTrophy,
  faRocket,
  faGem
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import axios from 'axios';

export default function AffiliatesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [affiliateStats, setAffiliateStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeReferrals: 0,
    conversionRate: 0,
    rank: 'Starter',
    recentReferrals: []
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("/api/sessions", {
          headers: { token: window.localStorage.getItem("token") },
        });
        
        if (!res.data.error) {
          setUser(res.data.user);
          await loadAffiliateStats(res.data.user._id);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const loadAffiliateStats = async (userId) => {
    try {
      const res = await axios.get('/api/affiliate/stats', { 
        headers: { token: window.localStorage.getItem("token") },
        params: { id: userId }
      });
      
      if (!res.data.error) {
        setAffiliateStats(res.data);
      }
    } catch (error) {
      console.error("Error loading affiliate stats:", error);
    }
  };

  const copyReferralLink = () => {
    if (typeof window !== 'undefined' && user?.referralCode) {
      navigator.clipboard.writeText(`https://seccx.pro/ref/${user.referralCode}`);
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Referral link copied to clipboard',
        showConfirmButton: false,
        timer: 1500,
        background: '#111',
        customClass: { popup: 'swal-dark' }
      });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
        <style jsx>{`
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #fff;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>SECCX.PRO | Affiliate Program</title>
      </Head>
      
      <div className="root">
        <Header user={user} />
        
        <div className="affiliate-container">
          <div className="affiliate-header">
            <FontAwesomeIcon icon={faHandshake} className="header-icon" />
            <h2>Affiliate Program</h2>
            <div className="rank-badge">
              <FontAwesomeIcon icon={faTrophy} />
              {affiliateStats.rank} Partner
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <FontAwesomeIcon icon={faMoneyBillTrendUp} className="stat-icon" />
              <div className="stat-content">
                <h3>Total Earnings</h3>
                <p>${affiliateStats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
              <div className="stat-content">
                <h3>Monthly Earnings</h3>
                <p>${affiliateStats.monthlyEarnings.toFixed(2)}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              <div className="stat-content">
                <h3>Active Referrals</h3>
                <p>{affiliateStats.activeReferrals}</p>
              </div>
            </div>
          </div>

          <div className="referral-section">
            <h3>Your Referral Link</h3>
            <div className="referral-link-container">
              <input 
                type="text" 
                value={`https://seccx.pro/ref/${user?.referralCode || ''}`}
                readOnly 
              />
              <button onClick={copyReferralLink}>
                <FontAwesomeIcon icon={faCopy} /> Copy
              </button>
            </div>
          </div>

          {affiliateStats.recentReferrals?.length > 0 && (
            <div className="recent-referrals">
              <h3>Recent Referrals</h3>
              <div className="referrals-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Date</th>
                      <th>Commission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliateStats.recentReferrals.map((ref, index) => (
                      <tr key={index}>
                        <td>{ref.username}</td>
                        <td>{ref.date}</td>
                        <td>${ref.commission.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${ref.status}`}>
                            {ref.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .root {
          width: 80%;
          margin: 0 auto;
          padding: 20px;
        }

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
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .header-icon {
          font-size: 24px;
          color: #6b21a8;
          filter: drop-shadow(0 0 8px rgba(107, 33, 168, 0.5));
        }

        .rank-badge {
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: bold;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          font-size: 24px;
          color: #6b21a8;
        }

        .stat-content h3 {
          color: #888;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .stat-content p {
          color: #fff;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .referral-section {
          margin-top: 30px;
        }

        .referral-link-container {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .referral-link-container input {
          flex: 1;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid rgba(107, 33, 168, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
        }

        .referral-link-container button {
          padding: 12px 24px;
          background: linear-gradient(45deg, #6b21a8, #4776E6);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .referral-link-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.2);
        }

        .recent-referrals {
          margin-top: 30px;
        }

        .referrals-table {
          margin-top: 15px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(107, 33, 168, 0.2);
        }

        th {
          color: #888;
          font-weight: normal;
          font-size: 14px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: rgba(0, 255, 68, 0.1);
          color: #00ff44;
        }

        .status-badge.pending {
          background: rgba(255, 170, 0, 0.1);
          color: #ffaa00;
        }

        @media (max-width: 768px) {
          .root {
            width: 95%;
            padding: 10px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .referral-link-container {
            flex-direction: column;
          }

          .referral-link-container button {
            width: 100%;
          }

          .affiliate-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}
