import mongoose from "mongoose";
import dbConnect from "../utils/dbConnect";

export default mongoose.models.RedeemCode ||
  mongoose.model(
    "RedeemCode",
    mongoose.Schema({
      code: String,
      amount: Number,
    })
  );
