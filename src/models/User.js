import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // absent for OAuth-only users
    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    phone: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      postCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
