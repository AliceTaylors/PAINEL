import User from './models/User';
import Check from './models/Check';
import dbConnect from './utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const totalUsers = await User.countDocuments();


  return res.send({
    totalUsers: totalUsers
  });
}
