import { body, cookie, param } from "express-validator";

const sendChangeEmailValidation = [
     body("email")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .bail()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter valid email"),
];

const changeEmailValidation = [
  param("token")
    .notEmpty()
    .withMessage("Missing token")
    .bail()
    .isHexadecimal()
    .withMessage("Invalid token"),
];

export { changeEmailValidation, sendChangeEmailValidation,  };
