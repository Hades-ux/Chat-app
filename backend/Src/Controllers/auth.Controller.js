import fileUpload from "../Utils/cloudinary.js"
import User from "../Models/User.Model.js";

const registerUser = async (req, res) => {

  // recive user data from frontend
  const { firstName, lastName, email, password, userName } = req.body;

  // validation
  if (!firstName) {
    return res
      .status(400)
      .json({ success: false, message: "First Name is required" });
  }

  if (!lastName) {
    return res
      .status(400)
      .json({ success: false, message: "Last Name is required" });
  }

  if (!userName) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // check for already exist(email and userName)

 // check email separately
const emailTaken = await User.findOne({ email });
if (emailTaken) {
  return res.status(409).json({
    success: false,
    message: `${email} is already registered`,
  });
}

// check username separately
const userNameTaken = await User.findOne({ userName });
if (userNameTaken) {
  return res.status(409).json({
    success: false,
    message: `${userName} is already taken`,
  });
}
  // check of avatar image file
 const avatarImg = req.files?.avatar?.[0]?.path
 if(!avatarImg){
  return res.status(400).json({
    success: false,
    message: "Avatar image is required"
  })
 }

  // upload avtar image
  let uploadAvtarImg;
    try {
       uploadAvtarImg = await fileUpload(avatarImg)
      
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "Error during the file upload",
        error: error.message
      })
      
    }

  // save user in DB

  try {
    const user = await User.create({
          firstName,
          lastName,
          email,
          password,
          userName: userName.toLowerCase(),
          avatar: {
            url: uploadAvtarImg.secure_url,
            public_id: uploadAvtarImg.public_id,
          },
        });

  return res.status(201).json({
  success: true,
  message: `${userName} user has been created`,
  user
})
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Could not creat the user",
      error: error.message
    })
  }

  // genrate token (login after user register)

  // return response

};

export { registerUser };
