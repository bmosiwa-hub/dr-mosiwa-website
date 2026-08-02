import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}
const FROM = "AstelPO <noreply@azariahmosiwa.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";

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

export async function sendViewerInvite({
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
    subject: `You've been given access to "${projectName}"`,
    html: `
      <p>Hi,</p>
      <p>You've been invited to view the project <strong>${projectName}</strong> in AstelPO.</p>
      <p>Click the link below to access it at any time:</p>
      <p><a href="${viewLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View Project</a></p>
      <p style="color:#888;font-size:12px;">Bookmark this link — you'll need it each time you want to access the project.</p>
    `,
  });
  if (error) {
    console.error("[Resend] sendViewerInvite error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] sendViewerInvite sent, id:", data?.id);
}
