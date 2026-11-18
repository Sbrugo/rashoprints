/* =====================================================================
   RASHO PRINTS — AUTORIZA LA SUBIDA DE ARCHIVOS DE PEDIDOS
   El navegador del cliente le pide permiso a esta función y después sube
   el archivo directo a Vercel Blob con un link firmado. Acá se controla
   qué se puede subir. Usa la conexión del almacenamiento que Vercel
   configura sola (BLOB_STORE_ID y BLOB_WEBHOOK_PUBLIC_KEY).
   (No hace falta tocar este archivo.)
   ===================================================================== */
import { handleUploadPresigned } from '@vercel/blob/client';
import { issueSignedToken } from '@vercel/blob';

const TAMANO_MAXIMO_MB = 25;
const EXTENSIONES = ['stl', 'obj', '3mf', 'step', 'stp', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'];
// pedidos/<código al azar>-<nombre>.<extensión>, armado por js/app.js
const RUTA_VALIDA = /^pedidos\/[a-z0-9]{16,}-[A-Za-z0-9_-]{1,60}\.[a-z0-9]{1,4}$/;

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!origenPermitido(req.headers.origin)) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }

  try {
    const respuesta = await handleUploadPresigned({
      request: req,
      body: req.body,
      getSignedToken: async (pathname) => {
        const extension = (pathname.split('.').pop() || '').toLowerCase();
        if (!RUTA_VALIDA.test(pathname) || !EXTENSIONES.includes(extension)) {
          throw new Error('Tipo de archivo no permitido');
        }
        const limites = {
          allowedContentTypes: ['model/*', 'image/*'],
          maximumSizeInBytes: TAMANO_MAXIMO_MB * 1024 * 1024,
          validUntil: Date.now() + 30 * 60 * 1000
        };
        const token = await issueSignedToken({ pathname, operations: ['put'], ...limites });
        return { token, urlOptions: limites };
      }
    });
    return res.status(200).json(respuesta);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
