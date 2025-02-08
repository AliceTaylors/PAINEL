import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faUser,
  faPhone,
  faEnvelope,
  faLocationDot,
  faMoneyBill,
  faCalendar,
  faVenusMars
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function Consulta() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const alerts = withReactContent(Swal);
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function getUser() {
      const res = await axios.get('/api/sessions', {
        headers: { token: window.localStorage.getItem('token') }
      });

      if (res.data.error) {
        router.push('/');
        return;
      }

      setUser(res.data.user);
    }

    getUser();
  }, []);

  const handleConsulta = async (e) => {
    e.preventDefault();

    if (!cpf.match(/^\d{11}$/)) {
      return alerts.fire({
        icon: 'error',
        title: 'CPF Inválido',
        text: 'Digite um CPF válido (11 dígitos)'
      });
    }

    const cost = 2.00; // Custo por consulta
    if (user.balance < cost) {
      return alerts.fire({
        icon: 'warning',
        title: 'Saldo Insuficiente',
        html: `Você precisa de $${cost} para fazer a consulta.<br/>Saldo atual: $${user.balance.toFixed(2)}`,
      });
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/consulta/cpf', {
        cpf: cpf
      }, {
        headers: { token: window.localStorage.getItem('token') }
      });

      setResult(res.data.result);
      
      // Atualizar saldo do usuário
      const userRes = await axios.get('/api/sessions', {
        headers: { token: window.localStorage.getItem('token') }
      });
      setUser(userRes.data.user);

    } catch (error) {
      alerts.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || 'Falha na consulta'
      });
    }
    setLoading(false);
  };

  return (
    <div className="consulta-page">
      <Head>
        <title>SECCX.PRO | Consulta CPF</title>
      </Head>

      <div className="container">
        <Header user={user} />
        
        <div className="content">
          <div className="consulta-header">
            <h1>
              <FontAwesomeIcon icon={faSearch} className="icon-glow" />
              Consulta CPF
            </h1>
            <p>Sistema Premium de Consulta de CPF</p>
          </div>

          <div className="search-form">
            <form onSubmit={handleConsulta}>
              <div className="form-group">
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  placeholder="Digite o CPF (somente números)"
                  maxLength="11"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Consultando...' : 'Consultar CPF'}
                </button>
              </div>
              <div className="cost-info">
                Custo por consulta: $2.00
              </div>
            </form>
          </div>

          {result && (
            <div className="result-container">
              <div className="person-info">
                <FontAwesomeIcon icon={faUser} className="section-icon" />
                <h2>{result.nomeCompleto}</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <FontAwesomeIcon icon={faVenusMars} />
                    <span>Gênero: {result.genero}</span>
                  </div>
                  <div className="info-item">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>Nascimento: {result.dataDeNascimento}</span>
                  </div>
                  <div className="info-item">
                    <FontAwesomeIcon icon={faMoneyBill} />
                    <span>Renda: R$ {result.salarioEstimado}</span>
                  </div>
                </div>
              </div>

              <div className="contact-section">
                <h3>
                  <FontAwesomeIcon icon={faPhone} />
                  Telefones
                </h3>
                <div className="phones-grid">
                  {result.listaTelefones.map((tel, index) => (
                    <div key={index} className="phone-item">
                      {tel.telefoneComDDD}
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-section">
                <h3>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Emails
                </h3>
                <div className="emails-grid">
                  {result.listaEmails.map((email, index) => (
                    <div key={index} className="email-item">
                      {email.enderecoEmail}
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-section">
                <h3>
                  <FontAwesomeIcon icon={faLocationDot} />
                  Endereços
                </h3>
                <div className="addresses-grid">
                  {result.listaEnderecos.map((end, index) => (
                    <div key={index} className="address-item">
                      {`${end.logradouro}, ${end.numero}${end.complemento ? ` - ${end.complemento}` : ''}`}
                      <br />
                      {`${end.bairro} - ${end.cidade}/${end.uf}`}
                      <br />
                      {`CEP: ${end.cep}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .consulta-page {
          min-height: 100vh;
          background: #000;
          color: #fff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .consulta-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .consulta-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #00ff44;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .icon-glow {
          filter: drop-shadow(0 0 10px #00ff44);
        }

        .search-form {
          background: #111;
          padding: 2rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          border: 1px solid #222;
        }

        .form-group {
          display: flex;
          gap: 1rem;
        }

        input {
          flex: 1;
          padding: 1rem;
          background: #000;
          border: 1px solid #222;
          border-radius: 5px;
          color: #fff;
          font-size: 1rem;
        }

        button {
          padding: 1rem 2rem;
          background: #00ff44;
          color: #000;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        button:hover {
          background: #00cc33;
        }

        button:disabled {
          background: #333;
          cursor: not-allowed;
        }

        .cost-info {
          margin-top: 1rem;
          text-align: center;
          color: #888;
        }

        .result-container {
          background: #111;
          padding: 2rem;
          border-radius: 10px;
          border: 1px solid #222;
        }

        .person-info {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #222;
        }

        .person-info h2 {
          color: #00ff44;
          margin: 1rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .info-item {
          background: #000;
          padding: 1rem;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-section {
          margin-bottom: 2rem;
        }

        .contact-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #00ff44;
          margin-bottom: 1rem;
        }

        .phones-grid,
        .emails-grid,
        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .phone-item,
        .email-item,
        .address-item {
          background: #000;
          padding: 1rem;
          border-radius: 5px;
          border: 1px solid #222;
        }

        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
          }

          button {
            width: 100%;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 
