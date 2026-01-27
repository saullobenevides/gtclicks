import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, code) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing. Printing code to console:", code);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Recommend user update this
      to: [email],
      subject: "Seu código de verificação",
      html: `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Este código expira em 10 minutos.</p>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Send email error:", err);
    return { success: false, error: err };
  }
}
