import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function Signup() {
  const router = useRouter();
  const MySwal = withReactContent(Swal);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: router.query.ref || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Enviar requisição para criar conta usando a rota correta
      const response = await axios.post('/api/users', {
        login: formData.username,
        password: formData.password,
        mail: formData.email,
        referralCode: formData.referralCode
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Sucesso
      await MySwal.fire({
        icon: 'success',
        title: 'Account created successfully!',
        text: 'You can now login to your account',
        background: '#111',
        customClass: {
          popup: 'colored-toast'
        }
      });

      router.push('/login');
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || error.message || 'An error occurred',
        background: '#111',
        customClass: {
          popup: 'colored-toast'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SECCX.PRO | Sign Up</title>
      </Head>

      <div className="signup-container">
        <div className="signup-box">
          <h1>
            <FontAwesomeIcon icon={faUserPlus} /> Create Account
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FontAwesomeIcon icon={faUser} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faUser} />
              <input
                type="text"
                name="referralCode"
                placeholder="Referral Code (Optional)"
                value={formData.referralCode}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link href="/login">Login here</Link>
          </p>
        </div>

        <style jsx>{`
          .signup-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #111;
          }

          .signup-box {
            background: rgba(17, 17, 17, 0.8);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(107, 33, 168, 0.2);
          }

          h1 {
            color: #fff;
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .input-group {
            position: relative;
            margin-bottom: 20px;
          }

          .input-group :global(svg) {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b21a8;
          }

          input {
            width: 100%;
            padding: 12px 40px;
            background: #1a1a1a;
            border: 1px solid rgba(107, 33, 168, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            transition: all 0.3s ease;
          }

          input:focus {
            border-color: #6b21a8;
            box-shadow: 0 0 0 2px rgba(107, 33, 168, 0.2);
            outline: none;
          }

          button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(45deg, #6b21a8, #4776E6);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(107, 33, 168, 0.2);
          }

          button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .login-link {
            text-align: center;
            margin-top: 20px;
            color: #888;
          }

          .login-link a {
            color: #6b21a8;
            text-decoration: none;
            font-weight: bold;
          }

          .login-link a:hover {
            text-decoration: underline;
          }

          :global(.colored-toast) {
            background: #111 !important;
            color: #fff !important;
            border: 1px solid rgba(107, 33, 168, 0.2) !important;
          }
        `}</style>
      </div>
    </>
  );
}
