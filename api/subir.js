/* =====================================================================
   RASHO PRINTS — AUTORIZA LA SUBIDA DE ARCHIVOS DE PEDIDOS
   El navegador del cliente le pide permiso a esta función y después sube
   el archivo directo a Vercel Blob. Acá se controla qué se puede subir.
   (No hace falta tocar este archivo.)
   ===================================================================== */
import { handleUpload } from '@vercel/blob/client';

const TAMANO_MAXIMO_MB = 25;
const EXTENSIONES = ['stl', 'obj', '3mf', 'step', 'stp', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'];

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
    const respuesta = await handleUpload({
      request: req,
      body: req.body,
      onBeforeGenerateToken: async (pathname) => {
        const extension = (pathname.split('.').pop() || '').toLowerCase();
        if (!pathname.startsWith('pedidos/') || !EXTENSIONES.includes(extension)) {
          throw new Error('Tipo de archivo no permitido');
        }
        return {
          allowedContentTypes: ['model/*', 'image/*'],
          maximumSizeInBytes: TAMANO_MAXIMO_MB * 1024 * 1024,
          addRandomSuffix: true,
          validUntil: Date.now() + 30 * 60 * 1000
        };
      }
    });
    return res.status(200).json(respuesta);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
