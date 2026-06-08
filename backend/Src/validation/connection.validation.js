import { body } from "express-validator";

const addConnectionValidation = [
  body("email")
    .notEmpty()
    .withMessage("Field cannot be empty")
    .trim()
    .normalizeEmail()
    .bail()
    .isEmail()
    .withMessage("Enter valid email"),
];

export { addConnectionValidation };
