import mongoose, { Schema, models } from "mongoose"

export interface IUser {
  name?: string
  email: string
  password?: string
  image?: string
  provider?: string
  emailVerified?: Date
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
    },
    image: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      default: "credentials",
    },
    emailVerified: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation
const User = models.User || mongoose.model<IUser>("User", UserSchema)

export default User
