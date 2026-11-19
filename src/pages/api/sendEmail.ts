import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import dns from 'node:dns';

export const prerender = false;

function smtpHost(): Promise<string> {
  return new Promise((resolve, reject) =>
    dns.resolve4('smtp.gmail.com', (err, addresses) => (err ? reject(err) : resolve(addresses[0])))
  );
}

const REQUIRED = ['name', 'company', 'email', 'phone', 'role', 'need', 'budget', 'message'] as const;

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Solicitud inválida.' }), { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!data[field] || typeof data[field] !== 'string') {
      return new Response(JSON.stringify({ error: `Falta el campo "${field}".` }), { status: 400 });
    }
  }

  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[api/sendEmail] Falta SMTP_USER/SMTP_PASS en el entorno.');
    return new Response(JSON.stringify({ error: 'El formulario no está disponible en este momento. Escríbenos directo a vamos@orquestialab.com.' }), { status: 500 });
  }

  // Destino fijo, no configurable por variable de entorno: todo mensaje del formulario
  // de /contacto debe llegar siempre a este buzón, sin depender de que alguien
  // configure (o configure mal) una variable en Vercel.
  const destinatario = 'vamos@orquestialab.com';

  try {
    const transporter = nodemailer.createTransport({
      host: await smtpHost(),
      port: 465,
      secure: true,
      tls: { servername: 'smtp.gmail.com' },
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const filas = REQUIRED.map((f) => `<p><strong>${f}:</strong> ${String(data[f]).replace(/</g, '&lt;')}</p>`).join('\n');

    await transporter.sendMail({
      from: `"OrquestiaLab — Contacto" <${SMTP_USER}>`,
      to: destinatario,
      replyTo: String(data.email),
      subject: `Nuevo contacto: ${String(data.name)} (${String(data.company)})`,
      html: `<h2>Nuevo mensaje desde orquestialab.com/contacto</h2>${filas}`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[api/sendEmail] Error al enviar:', err);
    return new Response(JSON.stringify({ error: 'No pudimos enviar el mensaje. Inténtalo de nuevo en un momento.' }), { status: 500 });
  }
};
