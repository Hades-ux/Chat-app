import { body, cookie, param } from "express-validator";

const registerUserValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .trim()
    .normalizeEmail()
    .bail()
    .isEmail()
    .withMessage("Enter valid email"),

  body("password")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters"),
];

const loginUserValidation = [
  body("email")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter valid email"),

  body("password")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters"),
];

const refreshTokenValidation = [
  cookie("refreshToken")
    .notEmpty()
    .withMessage("Missing token")
    .bail()
    .isJWT()
    .withMessage("Invalid token"),
];

const verifyUserValidation = [
  param("token")
    .notEmpty()
    .withMessage("Missing token")
    .bail()
    .isHexadecimal()
    .withMessage("Invalid token"),
];

const sendForgotPasswordEmailValidation = [
  body("email")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter valid email"),
];

const forgotPasswordValidation = [
  body("newPassword")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters"),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  param("token")
    .notEmpty()
    .withMessage("Missing token")
    .bail()
    .isHexadecimal()
    .withMessage("Invalid token"),
];

const changePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters"),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum 8 characters")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export {
  registerUserValidation,
  loginUserValidation,
  refreshTokenValidation,
  verifyUserValidation,
  sendForgotPasswordEmailValidation,
  forgotPasswordValidation,
  changePasswordValidation,
};
