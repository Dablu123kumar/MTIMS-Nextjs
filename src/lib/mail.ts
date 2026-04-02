import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Lazy transporter — only created when first email is sent
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Connection pooling for faster subsequent sends
      pool: true,
      maxConnections: 3,
      // Timeouts to prevent hanging
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });
  }
  return _transporter;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to.join(", ") : to;

  const info = await getTransporter().sendMail({
    from: `"DABIMS" <${process.env.SMTP_USER}>`,
    to: recipients,
    subject,
    text,
    html,
  });

  return info;
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), String(value));
  }
  return result;
}
