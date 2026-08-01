import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "bmosiwa@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, email, organisation, enquiryType, subject, message } = await req.json();

    if (!name || !email || !enquiryType || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Website Contact <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Enquiry] ${enquiryType}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0a1628; padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #f5c842; margin: 0;">New Enquiry from azariahmosiwa.com</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #d4a017;">${email}</a></td></tr>
              ${organisation ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Organisation</td><td style="padding: 8px 0;">${organisation}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Enquiry Type</td><td style="padding: 8px 0;">${enquiryType}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Subject</td><td style="padding: 8px 0; font-weight: 600;">${subject}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #374151; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
