import { body } from "express-validator";

 export const registerValidation = [
    
  body("fullName").trim()
  .notEmpty()
  .withMessage("Filed can not be empty")
  .isLength({min:3})
  .withMessage("Name must be at least 3 charactor"),

  body("email")
  .isEmail()
  .withMessage("Enter valid Email") ,

  body("password")
  .isLength({min:5})
  .withMessage("Password must be minimum 5 charactor")
  
 ]
