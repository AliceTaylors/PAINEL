import mongoose from "mongoose";

export default mongoose.models.Card ||
  mongoose.model(
    "Card",
    mongoose.Schema({
      number: String,
      data: String,
      pin: String,
      bin: String,
      price: Number,
    })
  );
