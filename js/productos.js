/* =====================================================================
   RASHO PRINTS — ARCHIVO DE CONFIGURACIÓN
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitás tocar para cambiar:
     · los datos de contacto,
     · los colores que se ofrecen en el formulario de pedido personalizado.

   Reglas para no romper nada:
     · Cada texto va entre comillas "así".
     · Cada elemento de una lista termina con una coma.
   Guardá el archivo y recargá la página en el navegador para ver los cambios.
   ===================================================================== */

window.RASHO_CONFIG = {

  /* ---------- DATOS DEL NEGOCIO ---------- */
  negocio: {
    nombre: "Rasho Prints",
    // Número de WhatsApp SOLO con números: código de país + 9 + área + número.
    whatsapp: "5491164254177",
    whatsappVisible: "+54 9 11 6425-4177",
    email: "rashoprints@gmail.com",
    instagramUsuario: "rashoprints",
    // ⚠ Verificá que este perfil exista y sea el de ustedes.
    instagramUrl: "https://www.instagram.com/rashoprints/",
    zonaRetiro: "Núñez"
  },

  /* ---------- ARCHIVOS STL ---------- */
  stl: {
    tamanoMaximoMB: 25,
    // true: el archivo se sube y el mensaje de WhatsApp lleva el link para descargarlo.
    // false: el cliente adjunta el archivo a mano en el chat (como antes).
    subirArchivos: true
  },

  /* ---------- COLORES DISPONIBLES ----------
     Se muestran en el selector "Color" del formulario de pedido personalizado.
     "hex" es el código del color. */
  colores: {
    negro:  { nombre: "Negro",  hex: "#1c1c1e" },
    blanco: { nombre: "Blanco", hex: "#f7f7f5" },
    gris:   { nombre: "Gris",   hex: "#8e9196" },
    rojo:   { nombre: "Rojo",   hex: "#c8402f" },
    azul:   { nombre: "Azul",   hex: "#2c5d93" },
    verde:  { nombre: "Verde",  hex: "#4d7c48" }
  }
};
