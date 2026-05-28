import createEmail from "../../Utils/createEmail";

const forgotPassword = (token) => {
  const link = `${process.env.CLIENT}/forgot-password/${token}`;

  return createEmail({
    subject: "Fhat app forgot password link",
    title: "Forgot password",
    message: "Click the link below to reset your password:",
    buttonText: "Forgot Password",
    link: link,
    expiry: "This link expires in 10 minutes",
  });
};

export default forgotPassword;
