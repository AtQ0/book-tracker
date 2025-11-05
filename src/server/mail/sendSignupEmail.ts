import { getTransporter } from "./transporter";

type SendSignupEmailArgs = {
  to: string;
  name: string;
  code: string;
  ttlMin: number;
};

export async function sendSignupEmail({
  to,
  name,
  code,
  ttlMin,
}: SendSignupEmailArgs) {
  const from =
    (process.env.MAIL_FROM ?? "no-reply@book-tracker.local").trim() ||
    "no-reply@book-tracker.local";

  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: "Your Book-Tracker verification code",
    text: `Hi ${name || "there"},
    \n\nYour verification code is: ${code}
    \nIt expires in ${ttlMin} minutes.\n`,
  });
}
