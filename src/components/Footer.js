import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faShieldAlt, faClock } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer style={{
      marginTop: '40px',
      padding: '30px',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,17,17,0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        <div>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#00ff00',
            marginBottom: '15px'
          }}>
            <FontAwesomeIcon icon={faRocket} />
            SECCX.PRO
          </h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Premium card checking service with high approval rates and reliable results.
          </p>
        </div>

        <div>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#00ff00',
            marginBottom: '15px'
          }}>
            <FontAwesomeIcon icon={faShieldAlt} />
            Security
          </h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Advanced encryption and secure payment processing for your safety.
          </p>
        </div>

        <div>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#00ff00',
            marginBottom: '15px'
          }}>
            <FontAwesomeIcon icon={faClock} />
            24/7 Support
          </h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Our team is always available to help you with any questions.
          </p>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ color: '#666' }}>
          © {new Date().getFullYear()} SECCX.PRO - All rights reserved
        </div>
        <div style={{
          display: 'flex',
          gap: '20px'
        }}>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Support</a>
        </div>
      </div>
    </footer>
  );
}
