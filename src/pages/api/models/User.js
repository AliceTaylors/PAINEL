import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  login: String,
  password: String,
  balance: {
    type: Number,
    default: 0
  },
  logs: {
    type: Array,
    default: []
  },
  mail: String,
  ipAddress: String,
  order: {
    amount: Number,
    complete: Boolean,
    currency: String,
    address: String,
    pricing: String,
    externalId: String,
  },
  adyen_block_until: Date,
  premium_block_until: Date
});

export default mongoose.models.User || mongoose.model('User', userSchema);
