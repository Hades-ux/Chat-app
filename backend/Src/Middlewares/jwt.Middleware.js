import  jwt  from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // get token from header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        sucesses: false,
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
      Sucesses: false,
      Message: "Error in retreving the token",
      Error: error.message,
    });
  }
};
