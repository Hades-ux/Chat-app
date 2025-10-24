import User from "../Models/User.Model.js";

const registerUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "ok",
  });

  // // recive data from frontend
  // const { firstName, email, password, userName, avatar } = req.body;

  // // validation
  // if (!firstName) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "First Name is required" });
  // }

  // if (!lastName) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Last Name is required" });
  // }

  // if (!userName) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Username is required" });
  // }

  // if (!email) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Email is required" });
  // }

  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(email)) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid email format" });
  // }

  // if (!password) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Password is required" });
  // }

  // if (password.length < 6) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Password must be at least 6 characters",
  //   });
  // }
};

export { registerUser };
