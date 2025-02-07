import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CheckerPage() {
  const [token, setToken] = useState('');
  const [cc, setCc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkCard() {
      if (!token || !cc) return;

      try {
        const response = await axios.get('/api/checker/check', {
          params: {
            token,
            cc
          }
        });
        setResult(response.data);
      } catch (error) {
        setResult({
          success: false,
          return: "#ERROR",
          message: error.message || 'Internal server error'
        });
      } finally {
        setLoading(false);
      }
    }

    checkCard();
  }, [token, cc]);

  return (
    <div>
      {/* Renderização do componente com base no estado result */}
    </div>
  );
} 
