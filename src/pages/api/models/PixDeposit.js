import mongoose from "mongoose";

export default mongoose.models.PixDeposit ||
  mongoose.model(
    "PixDeposit",
    mongoose.Schema(
      {
        userId: String,
        externalDepositId: String,
        externalDepositAddress: String,
        amount: Number,
        status: String,
      },
      {
        timestamps: true,
      }
    )
  );
