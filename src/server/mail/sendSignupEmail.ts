import { getTransporter } from "./transporter";

type SendSignupEmailArgs = {
  to: string;
  name: string;
  code: string;
  ttlMin: number;
  codeId: string;
};

export async function sendSignupEmail({
  to,
  name,
  code,
  ttlMin,
  codeId,
}: SendSignupEmailArgs) {
  const from =
    (process.env.MAIL_FROM ?? "no-reply@book-tracker.local").trim() ||
    "no-reply@book-tracker.local";

  const transporter = getTransporter();

  // Build verify link using the same session id that frontend will use
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // create full url by applying /verify on the base
  const url = new URL("/verify", appUrl);
  // amend full url by adding ?session=some-code and &source=email
  url.searchParams.set("session", codeId);
  url.searchParams.set("source", "email");
  const verifyUrl = url.toString();

  await transporter.sendMail({
    from,
    to,
    subject: "Your Book-Tracker verification code",
    text: `Hi ${name || "there"},
    \nYour verification code is: ${code}
    \nIt expires in ${ttlMin} minutes.
    \nOpen the verification page with this link:\n${verifyUrl}
    \nThen enter your code on that page to verify your email.
    \nRegards,\nBook-tracker
    `,
    html: `
    <p>Hi ${name || "there"},</p>

    <p>Your verification code is: <strong>${code}</strong></p>

    <p>It expires in ${ttlMin} minutes.</p>

    <p>
      Click here to verify your email:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>

    <p>Regards,<br>Book-tracker</p>
  `,
  });
}
