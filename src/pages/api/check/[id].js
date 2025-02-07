import { validateUser } from '../../../utils/auth';
import { processCheck } from '../../../utils/checker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { cc, checker = 'default' } = req.body;

  try {
    const user = await validateUser(id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const result = await processCheck(user, cc, checker);
    return res.json(result);

  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 