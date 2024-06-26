const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const donationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: false },
    campaign: { type: Schema.Types.ObjectId, ref: "User", index: false },
    amount: { type: Number, required: false },
    currency: { type: String, required: false },
    created: { type: Date, required: false },
    description: { type: String },
    paymentMethod: {
      brand: { type: String, required: false },
      expMonth: { type: Number, required: false },
      expYear: { type: Number, required: false },
      last4: { type: String, required: false }
    },
    receiptUrl: { type: String },
    customerId: { type: String },
    balanceTransactionId: { type: String },
    chargeId: { type: String, required: false, unique: false },
    campaignDonationId: {type: Schema.Types.ObjectId, ref: "campaignDonation", index: false  }  
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("donated", donationSchema, "campaignDonated");
