/* =====================================================================
   RASHO PRINTS — DESCARGA DE ARCHIVOS DE PEDIDOS
   El almacenamiento es privado: los archivos no se pueden abrir con un
   link directo. El mensaje de WhatsApp trae un link a esta función
   (/api/archivo?f=pedidos/...), que genera un permiso de descarga de
   10 minutos y redirige al archivo. Funciona hasta que el archivo se
   borra (30 días).
   (No hace falta tocar este archivo.)
   ===================================================================== */
import { issueSignedToken, presignUrl } from '@vercel/blob';

// Mismo formato que arma js/app.js y valida api/subir.js
const RUTA_VALIDA = /^pedidos\/[a-z0-9]{16,}-[A-Za-z0-9_-]{1,60}\.[a-z0-9]{1,4}$/;

export default async function handler(req, res) {
  const ruta = String((req.query && req.query.f) || '');
  if (!RUTA_VALIDA.test(ruta)) {
    return res.status(400).send('Link de archivo inválido.');
  }

  try {
    const validUntil = Date.now() + 10 * 60 * 1000;
    const token = await issueSignedToken({ pathname: ruta, operations: ['get'], validUntil });
    const { presignedUrl } = await presignUrl(token, {
      operation: 'get',
      pathname: ruta,
      access: 'private',
      validUntil
    });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.redirect(302, presignedUrl);
  } catch (error) {
    return res.status(404).send('El archivo no existe o ya se borró (se guardan 30 días).');
  }
}
