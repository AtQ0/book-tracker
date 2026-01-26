import { Resend } from "resend";
import { getTransporter } from "./transporter";

type SendSignupEmailArgs = {
  to: string;
  recipientName: string;
  verificationCode: string;
  ttlMin: number;
  verificationCodeId: string;
};

const provider = (process.env.EMAIL_PROVIDER ?? "maildev").toLowerCase();

// Lazy init so we only require the key when used
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("EMAIL_PROVIDER=resend but RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

export async function sendSignupEmail({
  to,
  recipientName: name,
  verificationCode,
  ttlMin,
  verificationCodeId,
}: SendSignupEmailArgs) {
  // Pick MAIL_FROM if set and non-empty; otherwise:
  // - for resend: use a known-good, pre-verified sender
  // - for maildev: keep local default
  const from =
    (process.env.MAIL_FROM ?? "").trim() ||
    (provider === "resend"
      ? "Book Tracker <onboarding@resend.dev>"
      : "no-reply@book-tracker.local");

  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const url = new URL("/verify", appUrl);
  url.searchParams.set("verificationCodeId", verificationCodeId);
  url.searchParams.set("source", "email");
  const verifyUrl = url.toString();

  const subject = "Your Book Tracker verification code";

  const rawText = `
  Hi ${name || "there"},

  Your verification code is: ${verificationCode}
  It expires in ${ttlMin} minutes.

  Open the verification page with this link:
  ${verifyUrl}

  Then enter your code on that page to verify your email.

  Regards,
  Book Tracker
`;

  const text = rawText.replace(/^\s+/gm, "").trimStart();

  const html = `
  <p>Hi ${name || "there"},</p>

  <p>Your verification code is: <strong>${verificationCode}</strong></p>

  <p>It expires in ${ttlMin} minutes.</p>

  <p>
    Click here to verify your email:<br>
    <a href="${verifyUrl}">${verifyUrl}</a>
  </p>

  <p>Regards,<br>Book Tracker</p>
`;

  if (provider === "resend") {
    const resend = getResend();

    await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    return;
  }

  // Default: MailDev via Nodemailer SMTP
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
