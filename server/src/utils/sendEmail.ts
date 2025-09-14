import nodemailer from 'nodemailer';
import env from '../config/env';

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL,
        pass: env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: env.EMAIL,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent:", error);
  }
};