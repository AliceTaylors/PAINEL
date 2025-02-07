import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { token, cc } = req.query;

    if (!token || !cc) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Verificar token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Lógica do checker aqui
    // ...

    res.json({
      success: true,
      result: 'Card check result'
    });

  } catch (error) {
    console.error('Error in checker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 