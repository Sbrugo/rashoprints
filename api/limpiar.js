/* =====================================================================
   RASHO PRINTS — BORRADO AUTOMÁTICO DE ARCHIVOS VIEJOS
   Vercel ejecuta esta función una vez por día (ver vercel.json) y borra
   los archivos de pedidos que tienen más de DIAS_GUARDADO días.
   Para cambiar el plazo, cambiá el número de abajo.
   ===================================================================== */
import { list, del } from '@vercel/blob';

const DIAS_GUARDADO = 30;

export default async function handler(req, res) {
  // Si está configurada la variable CRON_SECRET, solo Vercel puede ejecutar la limpieza
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.authorization !== `Bearer ${secreto}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const limite = Date.now() - DIAS_GUARDADO * 24 * 60 * 60 * 1000;
  let cursor;
  let borrados = 0;

  try {
    do {
      const pagina = await list({ prefix: 'pedidos/', cursor, limit: 1000 });
      const viejos = pagina.blobs
        .filter((b) => new Date(b.uploadedAt).getTime() < limite)
        .map((b) => b.url);
      if (viejos.length) {
        await del(viejos);
        borrados += viejos.length;
      }
      cursor = pagina.hasMore ? pagina.cursor : undefined;
    } while (cursor);

    return res.status(200).json({ borrados });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
