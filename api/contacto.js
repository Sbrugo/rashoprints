/* =====================================================================
   RASHO PRINTS — CORREOS QUE DEJAN EN EL PIE DE PÁGINA
   Guarda cada contacto en Vercel Blob (carpeta contactos/) y, si está
   configurada la variable RESEND_API_KEY, avisa por correo.
   Variables opcionales: CONTACTO_DESTINO y CONTACTO_REMITENTE.
   Los pasos para activar el aviso están en LEEME.txt.
   ===================================================================== */
import { put } from '@vercel/blob';
import { randomBytes } from 'node:crypto';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_CORREO = 120;
const MAX_MENSAJE = 600;

function origenPermitido(origen) {
  if (!origen) return true; // algunos navegadores no lo envían
  try {
    const host = new URL(origen).hostname;
    return host === 'rashoprints.com' || host.endsWith('.rashoprints.com') ||
           host.endsWith('.vercel.app') || host === 'localhost';
  } catch (e) {
    return false;
  }
}

async function guardar(contacto) {
  const codigo = randomBytes(8).toString('hex');
  const fecha = contacto.fecha.replace(/[:.]/g, '-');
  await put(`contactos/${fecha}-${codigo}.json`, JSON.stringify(contacto, null, 2), {
    access: 'private',
    contentType: 'application/json'
  });
}

async function avisar(contacto) {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return false;

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACTO_REMITENTE || 'Rasho Prints <onboarding@resend.dev>',
      to: [process.env.CONTACTO_DESTINO || 'rashoprints@gmail.com'],
      reply_to: contacto.correo,
      subject: `Nuevo contacto desde la web: ${contacto.correo}`,
      text: `Correo: ${contacto.correo}\n\nQué quiere imprimir:\n${contacto.mensaje || '(no escribió nada)'}\n\nRespondé este correo para escribirle.`
    })
  });
  if (!respuesta.ok) throw new Error(`Resend respondió ${respuesta.status}`);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!origenPermitido(req.headers.origin)) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }

  const datos = req.body && typeof req.body === 'object' ? req.body : {};

  // Campo invisible: solo lo completan los robots. Se responde bien y no se guarda.
  if (datos.empresa) return res.status(200).json({ ok: true });

  const correo = String(datos.correo || '').trim();
  const mensaje = String(datos.mensaje || '').trim().slice(0, MAX_MENSAJE);
  if (correo.length > MAX_CORREO || !CORREO_VALIDO.test(correo)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  const contacto = { correo, mensaje, fecha: new Date().toISOString() };
  const [guardado, aviso] = await Promise.allSettled([guardar(contacto), avisar(contacto)]);

  if (guardado.status === 'rejected') console.error('No se pudo guardar el contacto:', guardado.reason?.message);
  if (aviso.status === 'rejected') console.error('No se pudo avisar por correo:', aviso.reason?.message);

  // Alcanza con una de las dos vías: el contacto no se pierde
  const recibido = guardado.status === 'fulfilled' || (aviso.status === 'fulfilled' && aviso.value === true);
  if (!recibido) return res.status(502).json({ error: 'No se pudo registrar el contacto' });
  return res.status(200).json({ ok: true });
}
