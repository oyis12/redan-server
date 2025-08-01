import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log('Full Resend response:', response);

    const messageId = response?.data?.id;
    if (!messageId) {
      throw new Error('Resend response missing ID');
    }

    console.log('Email sent with ID:', messageId);
    return messageId;
  } catch (err) {
    console.error('Error sending email:', err?.response?.data || err.message || err);
    throw new Error('Email sending failed');
  }
};


export default sendEmail;
