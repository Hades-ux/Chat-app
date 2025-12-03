import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // verify token
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // attach user to req
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};
