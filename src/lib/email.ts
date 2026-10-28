import "server-only";
import { Resend } from "resend";
import { SITE_NAME } from "@/lib/site";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.log(`[email:not-configured] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || `${SITE_NAME} <onboarding@resend.dev>`;

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

function layout(heading: string, bodyHtml: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b6560; margin: 0 0 24px;">${SITE_NAME}</p>
      <h1 style="font-size: 20px; margin: 0 0 16px;">${heading}</h1>
      ${bodyHtml}
    </div>
  `;
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Verify your email — ${SITE_NAME}`,
    html: layout(
      "Verify your email",
      `<p style="color: #6b6560; line-height: 1.6;">Confirm this is your email address to finish setting up your account.</p>
       <p><a href="${url}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background: #a3241b; color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">Verify email</a></p>
       <p style="color: #a19c96; font-size: 13px; margin-top: 24px;">If you didn't create an account, you can ignore this email.</p>`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Reset your password — ${SITE_NAME}`,
    html: layout(
      "Reset your password",
      `<p style="color: #6b6560; line-height: 1.6;">Click below to choose a new password. This link expires in 1 hour.</p>
       <p><a href="${url}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background: #a3241b; color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">Reset password</a></p>
       <p style="color: #a19c96; font-size: 13px; margin-top: 24px;">If you didn't request this, you can ignore this email.</p>`
    ),
  });
}
