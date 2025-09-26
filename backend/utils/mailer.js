const nodemailer = require('nodemailer');

function bool(v, fallback = false) {
  if (v === undefined || v === null) return fallback;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = bool(process.env.SMTP_SECURE, smtpPort === 465);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

async function verify() {
  if (!transporter) throw new Error('SMTP not configured');
  return transporter.verify();
}

async function sendMail({ to, from, subject, text, replyTo }) {
  if (!transporter) throw new Error('SMTP not configured');
  return transporter.sendMail({ to, from, subject, text, replyTo });
}

module.exports = { transporter, verify, sendMail };
