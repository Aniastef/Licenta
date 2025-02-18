import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Poți folosi SendGrid, Mailgun etc.
  auth: {
    user: process.env.EMAIL_USER, // Email-ul tău
    pass: process.env.EMAIL_PASS, // Parola sau App Password
  },
});

export const sendVerificationEmail = async (userEmail, verificationToken) => {
  const verificationLink = `http://localhost:5173/verify/${verificationToken}`; // Schimbă domeniul în producție

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Confirm Your Email",
    html: `<h1>Welcome to Art Corner</h1>
           <p>Click the link below to verify your email:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};
