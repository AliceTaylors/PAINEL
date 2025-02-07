import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faGem, faStar, faAward } from '@fortawesome/free-solid-svg-icons';

export default function UserLevel({ user }) {
  const levels = {
    1: {
      name: "Starter",
      icon: faStar,
      color: "#4776E6",
      benefits: ["Basic Access", "Standard Support"]
    },
    2: {
      name: "Advanced",
      icon: faGem,
      color: "#6b21a8",
      benefits: ["5% Discount", "Priority Support", "Extended History"]
    },
    3: {
      name: "Premium",
      icon: faCrown,
      color: "#FFD700",
      benefits: ["15% Discount", "24/7 Support", "Custom Checker", "API Access"]
    }
  };

  const currentLevel = levels[user.level || 1];

  return (
    <div className="level-container">
      <div className="level-header">
        <FontAwesomeIcon 
          icon={currentLevel.icon} 
          className="level-icon"
          style={{ color: currentLevel.color }} 
        />
        <h2>{currentLevel.name} Level</h2>
      </div>

      <div className="benefits-list">
        {currentLevel.benefits.map((benefit, index) => (
          <div key={index} className="benefit-item">
            <FontAwesomeIcon icon={faAward} />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(user.experience / user.nextLevelExp) * 100}%`,
              background: `linear-gradient(45deg, ${currentLevel.color}, #4776E6)`
            }} 
          />
        </div>
        <div className="progress-text">
          {user.experience}/{user.nextLevelExp} XP to next level
        </div>
      </div>

      <style jsx>{`
        .level-container {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(107, 33, 168, 0.2);
          padding: 25px;
          margin: 20px 0;
        }

        .level-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .level-icon {
          font-size: 28px;
          filter: drop-shadow(0 0 8px rgba(107, 33, 168, 0.5));
        }

        .benefits-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: linear-gradient(45deg, rgba(107, 33, 168, 0.1), rgba(71, 118, 230, 0.1));
          border-radius: 8px;
          border: 1px solid rgba(107, 33, 168, 0.2);
        }

        .progress-section {
          margin-top: 20px;
        }

        .progress-bar {
          height: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          margin-top: 10px;
          font-size: 14px;
          color: #888;
        }
      `}</style>
    </div>
  );
} 
