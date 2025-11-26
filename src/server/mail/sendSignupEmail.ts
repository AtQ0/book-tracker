import sgMail from "@sendgrid/mail";
import { getTransporter } from "./transporter";

type SendSignupEmailArgs = {
  to: string;
  recipientName: string;
  verificationCode: string;
  ttlMin: number;
  verificationCodeId: string;
};

const provider = process.env.EMAIL_PROVIDER ?? "maildev";
const sendgridApiKey = process.env.SENDGRID_API_KEY;

if (provider === "sendgrid") {
  if (!sendgridApiKey) {
    throw new Error("EMAIL_PROVIDER=sendgrid but SENDGRID_API_KEY is not set");
  }

  sgMail.setApiKey(sendgridApiKey);
}

export async function sendSignupEmail({
  to,
  recipientName: name,
  verificationCode,
  ttlMin,
  verificationCodeId,
}: SendSignupEmailArgs) {
  // Pick MAIL_FROM if it exists and has content after trimming, otherwise fall back to the default address
  const from =
    (process.env.MAIL_FROM ?? "no-reply@book-tracker.local").trim() ||
    "no-reply@book-tracker.local"; // empty string is falsy after trim

  // Build verify link using the same verification code id that frontend will use
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // create full url by applying /verify on the base
  const url = new URL("/verify", appUrl);
  // amend full url by adding ?verificationCodeId=some-code and &source=email
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

  if (provider === "sendgrid") {
    // Send via SendGrid HTTP API
    await sgMail.send({
      to,
      from,
      subject,
      text,
      html,
    });
    return;
  }

  // Default: Maildev via Nodemailer SMTP
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
