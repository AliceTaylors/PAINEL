import { useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';

export default function CheckerPage() {
  const [cc, setCc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      const response = await axios.get('/api/checker/verify', {
        params: { token, cc }
      });
      setResult(response.data);
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Check failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      {/* Interface do checker */}
    </div>
  );
} 
