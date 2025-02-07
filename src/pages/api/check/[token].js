import { validateUser } from '../../../utils/auth';
import { processCheck } from '../../../utils/checker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;
  const { cc, checker = 'default' } = req.body;

  try {
    const user = await validateUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Resto da lógica do checker...
  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 