import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP for Material & Crafts Registration',
    html: `
      <h1>Welcome to Material & Crafts!</h1>
      <p>Your OTP for account verification is:</p>
      <h2 style="font-size: 24px; padding: 10px; background-color: #f3f4f6; text-align: center;">${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};