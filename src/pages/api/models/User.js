import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const customerSchema = new Schema({
  login: String,
  password: { type: String, select: false },
  admin: { type: Boolean, default: false },
  ipAddress: { type: String, select: false },
  balance: { type: Number, min: 0 },
  logs: [{ history_type: String, cost: Number, data: String }],
  order: {
    amount: { type: Number, default: 0 },
    complete: { type: Boolean, default: false },
    currency: { type: String },
    address: { type: String },
    pricing: { type: String },
    externalId: { type: String, default: "" },
  },
  cards: [String],
});

module.exports = mongoose.models.User || mongoose.model("User", customerSchema);
