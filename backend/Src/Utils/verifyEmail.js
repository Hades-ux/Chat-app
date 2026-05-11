import nodemailer from "nodemailer";

export const verifyMail = async (token,email) => {
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
      html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${token}">Verify Email</a>
      <p>This link expires in 15 minutes.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) { 
    console.error("Email send failed:", error.message);
  }
};
