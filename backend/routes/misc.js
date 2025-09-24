const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');

const router = express.Router();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Simple rate limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
});

router.post(
  '/contact',
  contactLimiter,
  [
    body('name').isString().trim().isLength({ min: 1, max: 80 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional({ checkFalsy: true, nullable: true }).isString().trim().isLength({ min: 7, max: 20 }),
    body('message').isString().trim().isLength({ min: 10, max: 2000 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: errors.array() });
      }

      const { name, email, message, phone } = req.body;

      const TO = process.env.CONTACT_TO || 'deepvaishnav207@gmail.com';
      const FROM = process.env.CONTACT_FROM || TO;

      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: TO,
          from: FROM,
          subject: `Chef Claude Contact: ${name}`,
          text: `New message from ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\n${message}`,
          replyTo: email,
        };
        try {
          await sgMail.send(msg);
        } catch (e) {
          console.error('SendGrid error:', e?.response?.body || e);
          // Fall through to console log to ensure no user-facing failure
        }
      }

      console.log('📩 Contact request:', { name, email, phone, message: message.slice(0, 200) + (message.length > 200 ? '...' : '') });

      return res.json({ success: true, message: 'Thanks! We received your message and will reply within 1-2 business days.' });
    } catch (err) {
      console.error('Contact error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit message' });
    }
  }
);

module.exports = router;
