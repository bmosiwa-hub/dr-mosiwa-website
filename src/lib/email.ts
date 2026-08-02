import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}
const FROM = "AstelPO <noreply@azariah.ca>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariah.ca";

export async function sendEditorInvite({
  email,
  projectName,
  inviterName,
  token,
}: {
  email: string;
  projectName: string;
  inviterName: string;
  token: string;
}) {
  const link = `${BASE_URL}/astelpo_26/join/${token}`;
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `You've been invited to collaborate on "${projectName}"`,
    html: `
      <p>Hi,</p>
      <p><strong>${inviterName}</strong> has invited you to collaborate as an <strong>Editor</strong> on the project <strong>${projectName}</strong> in AstelPO.</p>
      <p>To accept, create your account by clicking the link below. This link expires in 7 days.</p>
      <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Accept Invitation</a></p>
      <p style="color:#888;font-size:12px;">If you didn't expect this, you can ignore this email.</p>
    `,
  });
  if (error) {
    console.error("[Resend] sendEditorInvite error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] sendEditorInvite sent, id:", data?.id);
}

export async function sendViewerApprovalRequest({
  ownerEmail,
  requesterEmail,
  projectName,
  approvalLink,
}: {
  ownerEmail: string;
  requesterEmail: string;
  projectName: string;
  approvalLink: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `Access request for "${projectName}"`,
    html: `
      <p>Hi,</p>
      <p><strong>${requesterEmail}</strong> is requesting viewer access to your project <strong>${projectName}</strong>.</p>
      <p>Click below to approve their access (valid for 48 hours):</p>
      <p><a href="${approvalLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Approve Access</a></p>
      <p style="color:#888;font-size:12px;">If you don't recognize this request, ignore this email.</p>
    `,
  });
  if (error) {
    console.error("[Resend] sendViewerApprovalRequest error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] sendViewerApprovalRequest sent, id:", data?.id);
}

export async function sendViewerAccessGranted({
  email,
  projectName,
  viewLink,
}: {
  email: string;
  projectName: string;
  viewLink: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your access to "${projectName}" has been approved`,
    html: `
      <p>Hi,</p>
      <p>Your request to view <strong>${projectName}</strong> has been approved. Your access is valid for 48 hours.</p>
      <p><a href="${viewLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View Project</a></p>
    `,
  });
  if (error) {
    console.error("[Resend] sendViewerAccessGranted error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] sendViewerAccessGranted sent, id:", data?.id);
}
