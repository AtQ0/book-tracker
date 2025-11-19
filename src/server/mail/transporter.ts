import nodemailer from "nodemailer";

// cached singleton instance of a transporter
let _transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  // If a transporter has already been created, return the cached one
  if (_transporter) return _transporter;

  // Parse SMTP port or fall back to MailDev default (1025)
  const smtpPort = Number(process.env.SMTP_PORT?.trim() ?? 1025);

  // Create a new Nodemailer transporter (SMTP connection settings)
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() ?? "localhost", // default MailDev host
    port: smtpPort,
    secure: smtpPort === 465, //If using port 465, then enable secure mode (TLS)
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER.trim(),
            pass: process.env.SMTP_PASS.trim(),
          }
        : undefined, // skip auth if not set (e.g. MailDev)
  });

  // Cache and return the initialized transporter
  return _transporter;
}
