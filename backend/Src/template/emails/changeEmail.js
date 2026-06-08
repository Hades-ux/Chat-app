import createEmail from "../../Utils/createEmail";

const changeEmail = (token) => {
  const link = `${process.env.CLIENT}/change-email/${token}`;

  return createEmail({
    subject: "chat app change email link",
    title: "Change email request",
    message: "Click the link below change the email:",
    buttonText: "Change email",
    link: link,
    expiry: "This link expires in 10 minutes",
  });
};

export default changeEmail;