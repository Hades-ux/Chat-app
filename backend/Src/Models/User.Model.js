import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    googleId: {
      type: String, // for Google OAuth
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // for new or modified password
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
userSchema.method.isPassswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.method.generateAccessToken = function () {
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

userSchema.method.generateRefreshToken = function () {

  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFERESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFERESH_TOKEN_EXPIRY,
    }
  );
};

export default mongoose.model("User", userSchema);
