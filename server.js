// ==========================================================
// Secure Uplink — Contact Form Backend
// Receives POST /api/contact from the portfolio site and
// emails it to you via Nodemailer.
// ==========================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*', // lock this to your real site domain in production
  })
);

// Basic abuse protection: max 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
});

// ---- Mail transport ----
// Works with Gmail (App Password), Outlook, or any SMTP provider.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ---- Helpers ----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Routes ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, message, website } = req.body;

    // Honeypot field — real users never fill this. Bots often do.
    if (website) {
      return res.status(200).json({ success: true }); // silently drop, pretend success
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are all required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long.' });
    }

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVING_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Something went wrong sending your message. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure Uplink backend running on http://localhost:${PORT}`);
});
