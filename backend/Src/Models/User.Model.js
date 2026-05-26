import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    avatar: {
      type: {
        url: { type: String },
        public_id: { type: String },
      },
      default: {},
    },

    email: {
      index: true,
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],

    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    googleId: {
      type: String, // for Google OAuth
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// for new or modified password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    // password hashing
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// matching the password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// lastActive
userSchema.methods.updateLastActive = function () {
  return this.updateOne({
    lastActive: Date.now(),
  });
};

// Refresh token (hashing later)
userSchema.methods.setRefreshToken = function (newRefreshToken) {
    return this.updateOne({
    refreshToken: newRefreshToken,
  });
};

export default mongoose.model("User", userSchema);
