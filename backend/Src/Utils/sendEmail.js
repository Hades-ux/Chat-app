import transporter from "./emailTransporter.js"

const sendEmail = async ( email, data) => {
  try {
    const mailOptions = {
      from: `"Chat App" <${process.env.EMAIL}>`,
      to: email,
      ...data
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error
  }
};

export default sendEmail;
