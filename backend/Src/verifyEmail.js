import nodemailer from "nodemailer";

export const verifyMail = async (token, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: `"Chat App" <${process.env.EMAIL}>`,
      to: email,
      subject: "Email Verification",
      text: `Your OTP is ${token}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};
