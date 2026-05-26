import { body } from "express-validator";

 export const registerUserValidation = [
    
  body("fullName").trim()
  .notEmpty()
  .withMessage("Filed can not be empty")
  .isLength({min:3})
  .withMessage("Name must be at least 3 charactor"),

  body("email")
  .trim()
  .isEmail()
  .withMessage("Enter valid Email") ,

  body("password")
  .isLength({min:8})
  .withMessage("Password must be minimum 8 charactor")
  
 ]

 export const loginUserValidation = [

  body("email")
  .trim()
  .isEmail()
  .withMessage("Enter valid Email") ,

  body("password")
  .isLength({min:8})
  .withMessage("Password must be minimum 8 charactor")

 ]
 
