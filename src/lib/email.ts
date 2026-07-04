import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";
import type { MemberRole } from "@/lib/project-access";

const LOGO_URL = `${getSiteUrl()}/images/idevio-logo.png`;

function roleLabel(role: MemberRole): string {
  return role === "editor" ? "Can edit" : "View only";
}

function buildInviteHtml(input: {
  inviteUrl: string;
  projectName: string;
  inviterName: string;
  role: MemberRole;
}): string {
  const { inviteUrl, projectName, inviterName, role } = input;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Join ${projectName} on ${PRODUCT_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2f8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#0b1220 0%,#1e293b 100%);padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.35);">
            <tr>
              <td style="padding:32px 32px 20px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);text-align:center;">
                <img src="${LOGO_URL}" alt="${PRODUCT_NAME}" width="64" height="64" style="display:block;margin:0 auto 16px;border-radius:16px;" />
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;">Team invite</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;font-weight:700;">You're invited to build together</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
                  <strong style="color:#0f172a;">${inviterName}</strong> invited you to join the
                  <strong style="color:#0f172a;">${projectName}</strong> workspace on
                  <strong style="color:#0f172a;">${PRODUCT_NAME}</strong>.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Access level</p>
                      <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">${roleLabel(role)}</p>
                      <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
                        ${
                          role === "editor"
                            ? "You can edit the roadmap, tasks, team chat, and workspace modules."
                            : "You can view the workspace and participate in team chat without editing."
                        }
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                  Create a free ${PRODUCT_NAME} account with this email address, then accept the invite to jump into the founder workspace.
                </p>
                <a href="${inviteUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:14px;">
                  Accept invite & join workspace
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  Or copy this link into your browser:<br />
                  <a href="${inviteUrl}" style="color:#334155;word-break:break-all;">${inviteUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
                  Sent by ${COMPANY_NAME} · ${PRODUCT_NAME} Founder OS<br />
                  If you weren't expecting this invite, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export type EmailSendResult =
  | { sent: true }
  | { sent: false; reason: string };

function parseResendError(detail: string): string {
  try {
    const json = JSON.parse(detail) as { message?: string; error?: string };
    const message = json.message ?? json.error ?? detail;
    if (/only send testing emails to your own email address/i.test(message)) {
      return "Resend is in test mode — it can only email your Resend account address until you verify ideviolabs.com. Copy the invite link below and send it manually.";
    }
    if (/invalid api key/i.test(message)) {
      return "Invalid RESEND_API_KEY on the server. Check Vercel env vars and redeploy.";
    }
    if (/domain is not verified/i.test(message)) {
      return "Your sending domain is not verified in Resend yet. Copy the invite link below for now.";
    }
    return message;
  } catch {
    return detail || "Email provider rejected the message.";
  }
}

export async function sendTeamInviteEmail(input: {
  to: string;
  inviteUrl: string;
  projectName: string;
  inviterName: string;
  role: MemberRole;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() || `${PRODUCT_NAME} <onboarding@resend.dev>`;

  const subject = `${input.inviterName} invited you to ${input.projectName} on ${PRODUCT_NAME}`;
  const html = buildInviteHtml(input);

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set. Invite link:", input.inviteUrl);
    return {
      sent: false,
      reason:
        "RESEND_API_KEY is not set on the server. Copy the invite link below and share it manually.",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[email] Resend failed:", detail);
    return { sent: false, reason: parseResendError(detail) };
  }

  return { sent: true };
}

export async function sendWeeklyDigestEmail(input: {
  to: string;
  firstName: string;
  projects: {
    name: string;
    progress: number;
    streak: number;
    nextMilestone: string;
  }[];
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() || `${PRODUCT_NAME} <onboarding@resend.dev>`;

  const rows = input.projects
    .map(
      (p) =>
        `<tr><td style="padding:12px;border-bottom:1px solid #e2e8f0;"><strong>${p.name}</strong><br/><span style="color:#64748b;font-size:12px;">${p.nextMilestone}</span></td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${p.progress}%</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${p.streak}d streak</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><body style="font-family:Segoe UI,sans-serif;background:#f8fafc;padding:24px;"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;"><h1 style="color:#0f172a;">Your weekly founder digest</h1><p>Hi ${input.firstName}, here's your portfolio pulse from ${PRODUCT_NAME}.</p><table width="100%" style="margin-top:20px;border-collapse:collapse;">${rows}</table><p style="margin-top:24px;"><a href="${getSiteUrl()}/dashboard" style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Open Command Center</a></p></div></body></html>`;

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured." };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Your weekly founder digest — ${PRODUCT_NAME}`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { sent: false, reason: parseResendError(detail) };
  }

  return { sent: true };
}
