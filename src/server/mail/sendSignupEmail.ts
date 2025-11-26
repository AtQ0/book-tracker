import { getTransporter } from "./transporter";

type SendSignupEmailArgs = {
  to: string;
  recipientName: string;
  verificationCode: string;
  ttlMin: number;
  verificationCodeId: string;
};

export async function sendSignupEmail({
  to,
  recipientName: name,
  verificationCode: verificationCode,
  ttlMin,
  verificationCodeId: verificationCodeId,
}: SendSignupEmailArgs) {
  // Pick MAIL_FROM if it exists and has content after trimming, otherwise fall back to the default address
  const from =
    (process.env.MAIL_FROM ?? "no-reply@book-tracker.local").trim() ||
    "no-reply@book-tracker.local"; // empty string is falsy after trim

  // Get the cached Nodemailer transporter
  const transporter = getTransporter();

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

  await transporter.sendMail({
    from,
    to,
    subject: "Your Book-Tracker verification code",
    text: `Hi ${name || "there"},
    \nYour verification code is: ${verificationCode}
    \nIt expires in ${ttlMin} minutes.
    \nOpen the verification page with this link:\n${verifyUrl}
    \nThen enter your code on that page to verify your email.
    \nRegards,\nBook-tracker
    `,
    html: `
    <p>Hi ${name || "there"},</p>

    <p>Your verification code is: <strong>${verificationCode}</strong></p>

    <p>It expires in ${ttlMin} minutes.</p>

    <p>
      Click here to verify your email:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>

    <p>Regards,<br>Book-tracker</p>
  `,
  });
}
