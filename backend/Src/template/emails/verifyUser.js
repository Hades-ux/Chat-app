import createEmail from "../../Utils/createEmail.js";

const verifyUser = (token) => {
  const link = `${process.env.CLIENT}/verify-email/${token}`;

  return createEmail({
    subject: "user verfication link from chat app",
    title: "Account verification",
    message: "Click the link below to verify your account",
    buttonText: "verify email",
    link: link,
    expiry: "This link expires in 10 minutes",
  });
};

export default verifyUser;
