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

export async function sendOrderConfirmationEmail({
  email,
  orderId,
  items,
  total,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY missing. Cannot send order confirmation email.",
    );
    return { success: true, mocked: true };
  }

  const orderIdShort = orderId.slice(-8).toUpperCase();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.vercel.app";

  const itemsHtml = items
    .map(
      (item) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="100" style="vertical-align: top;">
              <img src="${item.previewUrl}" alt="${item.titulo}" width="80" height="80" style="border-radius: 4px; object-fit: cover;" />
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${item.titulo}</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">${item.width}x${item.height}px • ${(item.tamanhoBytes / 1024 / 1024).toFixed(2)} MB</p>
              <a href="${appUrl}/api/download/${item.downloadToken}" 
                 style="display: inline-block; padding: 8px 16px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                Baixar Foto Original
              </a>
            </td>
          </tr>
        </table>
      </div>
    `,
    )
    .join("");

  try {
    const { data, error } = await resend.emails.send({
      from: "GT Clicks <contato@gtclicks.com.br>", // Update this when domain is verified
      to: [email],
      subject: `Seu pedido #${orderIdShort} está pronto!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #0070f3;">Obrigado pela sua compra!</h1>
          <p>Olá, seu pagamento para o pedido <strong>#${orderIdShort}</strong> foi confirmado com sucesso.</p>
          <p>Abaixo estão os links para baixar suas fotos em alta resolução:</p>
          
          <div style="margin: 30px 0;">
            ${itemsHtml}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold;">Resumo do Pedido:</p>
            <p style="margin: 5px 0 0 0;">Total: R$ ${Number(total).toFixed(2)}</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #888;">
            Se você tiver qualquer dúvida, entre em contato conosco respondendo a este e-mail.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="text-align: center; font-size: 12px; color: #aaa;">
            © ${new Date().getFullYear()} GT Clicks. Todos os direitos reservados.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error (Order Confirmation):", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Send order confirmation email error:", err);
    return { success: false, error: err };
  }
}
