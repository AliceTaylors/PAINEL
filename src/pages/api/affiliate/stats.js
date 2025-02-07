import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { id } = req.query; // Mudando de userId para id
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Buscar usuário
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Buscar referidos
    const referrals = await User.find({ 
      $or: [
        { referralCode: user.referralCode },
        { referredBy: id }
      ]
    });
    
    // Calcular estatísticas
    const activeReferrals = referrals.length;
    const totalEarnings = user.logs.reduce((acc, log) => {
      if (log.history_type === 'REFERRAL_COMMISSION') {
        return acc + (log.cost || 0);
      }
      return acc;
    }, 0);

    const monthlyEarnings = user.logs.reduce((acc, log) => {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const logDate = new Date(log.date);
      
      if (log.history_type === 'REFERRAL_COMMISSION' && 
          logDate.getMonth() === thisMonth && 
          logDate.getFullYear() === thisYear) {
        return acc + (log.cost || 0);
      }
      return acc;
    }, 0);

    const totalVisits = user.referralVisits || 0;
    const conversionRate = totalVisits > 0 ? 
      ((activeReferrals / totalVisits) * 100).toFixed(1) : 0;

    let rank = 'Starter';
    if (totalEarnings >= 1000) rank = 'Gold';
    else if (totalEarnings >= 500) rank = 'Silver';
    else if (totalEarnings >= 100) rank = 'Bronze';

    res.json({
      totalEarnings,
      monthlyEarnings,
      activeReferrals,
      conversionRate,
      rank,
      recentReferrals: referrals.map(ref => ({
        username: ref.login.replace(/(?<=.{3})./g, '*'),
        date: new Date(ref.createdAt).toISOString().split('T')[0],
        commission: ref.logs.reduce((acc, log) => {
          if (log.history_type === 'REFERRAL_COMMISSION') {
            return acc + (log.cost || 0);
          }
          return acc;
        }, 0),
        status: ref.active ? 'active' : 'pending'
      })).slice(0, 5)
    });

  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
