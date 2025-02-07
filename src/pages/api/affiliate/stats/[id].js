import dbConnect from '../../../../utils/dbConnect';
import User from '../../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { id } = req.query;
    const token = req.headers.token;

    // Resto da lógica de stats...
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 