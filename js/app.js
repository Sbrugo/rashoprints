/* =====================================================================
   RASHO PRINTS — LÓGICA DE LA PÁGINA
   Navegación, animaciones y formulario de pedido personalizado (STL o imagen).
   No hace falta editar este archivo para cambiar contacto o colores:
   eso está en js/productos.js
   ===================================================================== */
(function () {
  'use strict';

  var cfg = window.RASHO_CONFIG;
  if (!cfg) { console.error('No se encontró la configuración (js/productos.js).'); return; }

  var MAX_MB = Number(cfg.stl && cfg.stl.tamanoMaximoMB) || 25;
  var MAX_BYTES = MAX_MB * 1024 * 1024;

  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };

  /* ---------- Utilidades ---------- */
  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pesoArchivo(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function enlaceWhatsApp(mensaje) {
    return 'https://wa.me/' + cfg.negocio.whatsapp + '?text=' + encodeURIComponent(mensaje);
  }
  function abrirWhatsApp(url) {
    try {
      var ventana = window.open(url, '_blank', 'noopener');
      if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
        window.location.href = url;
      }
      return true;
    } catch (e) {
      window.location.href = url;
      return true;
    }
  }

  /* =========================================================
     DATOS DE CONTACTO (desde la configuración)
     ========================================================= */
  function aplicarContacto() {
    var n = cfg.negocio;
    $$('[data-link="whatsapp"]').forEach(function (a) { a.href = 'https://wa.me/' + n.whatsapp; });
    $$('[data-link="email"]').forEach(function (a) { a.href = 'mailto:' + n.email; });
    $$('[data-link="instagram"]').forEach(function (a) { a.href = n.instagramUrl; });
    $$('[data-wa-mensaje]').forEach(function (a) { a.href = enlaceWhatsApp(a.getAttribute('data-wa-mensaje')); });
    $$('[data-text]').forEach(function (el) {
      var v = n[el.getAttribute('data-text')];
      if (v) el.textContent = v;
    });
    $$('[data-max-mb]').forEach(function (el) { el.textContent = MAX_MB; });
    var anio = $('#anio'); if (anio) anio.textContent = new Date().getFullYear();
  }

  /* =========================================================
     MENÚ MÓVIL Y NAVEGACIÓN
     ========================================================= */
  var menu = $('#menu'), botonMenu = $('#botonMenu');
  function cerrarMenu() {
    if (!menu.classList.contains('abierto')) return;
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    botonMenu.setAttribute('aria-label', 'Abrir menú');
  }
  botonMenu.addEventListener('click', function () {
    var abierto = menu.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', String(abierto));
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) cerrarMenu(); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#menu') && !e.target.closest('#botonMenu')) cerrarMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });

  var barra = $('#barra');
  var progreso = $('#progreso');
  var hero = $('.hero'), heroContenido = $('.hero__contenido'), heroVideo = $('.hero__video-fondo');
  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollPendiente = false;

  function efectosScroll() {
    scrollPendiente = false;
    var y = window.scrollY;
    barra.classList.toggle('con-borde', y > 8);

    var recorrido = document.documentElement.scrollHeight - window.innerHeight;
    if (progreso) progreso.style.transform = 'scaleX(' + (recorrido > 0 ? Math.min(1, y / recorrido) : 0) + ')';

    // Parallax de la portada: el texto sube y se desvanece, el video se acerca
    if (sinMovimiento || !hero || !heroContenido) return;
    var p = Math.min(1, y / hero.offsetHeight);
    heroContenido.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0)';
    heroContenido.style.opacity = Math.max(0, 1 - p * 1.2).toFixed(3);
    if (heroVideo) heroVideo.style.transform = 'scale(' + (1 + p * 0.12).toFixed(4) + ')';
  }
  window.addEventListener('scroll', function () {
    if (scrollPendiente) return;
    scrollPendiente = true;
    requestAnimationFrame(efectosScroll);
  }, { passive: true });
  window.addEventListener('resize', efectosScroll);
  efectosScroll();

  // Luz que sigue al cursor sobre las tarjetas
  function activarFocos() {
    $$('.material, .beneficio').forEach(function (el) { el.classList.add('foco'); });
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.foco');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function observarSecciones() {
    if (!('IntersectionObserver' in window)) return;
    var enlaces = $$('#menu a[href^="#"]');
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        enlaces.forEach(function (a) { a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });

    var rev = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('visto');
        rev.unobserve(el);
        // Al terminar la animación se quitan las clases para que vuelvan las transiciones propias (hover)
        var retraso = parseFloat(el.style.getPropertyValue('--retraso')) || 0;
        setTimeout(function () {
          el.classList.remove('revelar', 'visto');
          el.style.removeProperty('--retraso');
        }, retraso + 1700);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    $$('.seccion__cabecera, .comparar, .nosotros__imagen, .nosotros__texto, .stl__intro, .formulario, .llaveros__texto, .llaveros__imagen, .llaveros__subtitulo, .llaveros__banda').forEach(function (el) {
      el.classList.add('revelar');
    });
    // Grillas: cada elemento aparece con un pequeño retraso respecto del anterior
    $$('.pasos, .materiales, .contactos, .faq__lista, .beneficios').forEach(function (grupo) {
      Array.prototype.forEach.call(grupo.children, function (hijo, i) {
        hijo.classList.add('revelar');
        hijo.style.setProperty('--retraso', (i % 4) * 90 + 'ms');
      });
    });
    $$('.revelar').forEach(function (el) { rev.observe(el); });
  }

  /* =========================================================
     ANIMACIÓN "IDEAS QUE TOMAN FORMA"
     Idea → diseño → impresión capa por capa → producto
     ========================================================= */
  function animacionIdea() {
    var fig = $('#animacionIdea');
    if (!fig) return;
    var relleno = $('#aniRelleno', fig), volumen = $('#aniRellenoVol', fig), capa = $('#aniCapa', fig);
    var cabezal = $('#aniCabezal', fig), riel = $('#aniRiel', fig);
    var BASE = 470, ALTO = 222, CAPA = 6;
    var REPOSO = { x: 180, y: 150 }, FIN = { x: 300, y: BASE - ALTO - 2 };
    var FASES = [['idea', 2400], ['diseno', 2200], ['impresion', 5600], ['listo', 2600]];
    var TOTAL = FASES.reduce(function (s, f) { return s + f[1]; }, 0);
    // Medio ancho aproximado de la pieza según la altura impresa (para el recorrido del cabezal)
    var PERFIL = [[0, 58], [40, 70], [90, 74], [140, 48], [185, 32], [222, 38]];

    function medioAncho(h) {
      for (var i = 1; i < PERFIL.length; i++) {
        if (h <= PERFIL[i][0]) {
          var a = PERFIL[i - 1], b = PERFIL[i];
          return a[1] + (b[1] - a[1]) * (h - a[0]) / (b[0] - a[0]);
        }
      }
      return 38;
    }
    function suavizar(t) { return 1 - Math.pow(1 - t, 3); }

    function dibujar(h, x, y) {
      relleno.setAttribute('y', BASE - h); relleno.setAttribute('height', h);
      volumen.setAttribute('y', BASE - h); volumen.setAttribute('height', h);
      capa.setAttribute('y', BASE - h - CAPA);
      cabezal.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      riel.setAttribute('transform', 'translate(0 ' + y.toFixed(1) + ')');
    }

    function fotograma(t) {
      var resto = t % TOTAL, fase = FASES[0][0], dur = FASES[0][1];
      for (var i = 0; i < FASES.length; i++) {
        if (resto < FASES[i][1]) { fase = FASES[i][0]; dur = FASES[i][1]; break; }
        resto -= FASES[i][1];
      }
      if (fig.getAttribute('data-fase') !== fase) fig.setAttribute('data-fase', fase);

      if (fase === 'impresion') {
        var h = Math.floor((resto / dur) * ALTO / CAPA) * CAPA;
        dibujar(h, 300 + Math.sin(resto / 70) * medioAncho(h), BASE - h - 2);
      } else if (fase === 'listo') {
        var p = suavizar(Math.min(1, resto / 900));
        dibujar(ALTO, FIN.x + (REPOSO.x - FIN.x) * p, FIN.y + (REPOSO.y - FIN.y) * p);
      } else {
        // En "idea" la pieza anterior se desvanece; en "diseño" la cama queda vacía
        dibujar(fase === 'idea' ? ALTO : 0, REPOSO.x, REPOSO.y);
      }
    }

    if (sinMovimiento) { fig.setAttribute('data-fase', 'listo'); dibujar(ALTO, REPOSO.x, REPOSO.y); return; }

    // Solo corre mientras está en pantalla
    var tiempo = 0, anterior = null, cuadro = null, visible = false;
    function bucle(ahora) {
      if (anterior !== null) tiempo += Math.min(100, ahora - anterior);
      anterior = ahora;
      fotograma(tiempo);
      cuadro = requestAnimationFrame(bucle);
    }
    function actualizar() {
      var correr = visible && !document.hidden;
      if (correr && cuadro === null) { anterior = null; cuadro = requestAnimationFrame(bucle); }
      if (!correr && cuadro !== null) { cancelAnimationFrame(cuadro); cuadro = null; }
    }
    fotograma(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) { visible = entradas[0].isIntersecting; actualizar(); }).observe(fig);
    } else { visible = true; }
    document.addEventListener('visibilitychange', actualizar);
    actualizar();
  }

  /* =========================================================
     FORMULARIO STL — COMPARTIR POR WHATSAPP
     ========================================================= */
  var form = $('#formSTL');
  var entradaArchivo = $('#archivoSTL');
  var zona = $('#zonaSoltar');
  var archivoActual = null;
  var modo = 'stl';
  var imagenActual = null, urlVista = null;
  var botonEnviar = $('#btnCompartirSTL');

  /* ---------- SUBIDA DEL ARCHIVO A VERCEL BLOB ----------
     El archivo se sube apenas el cliente lo elige, y el mensaje de WhatsApp
     lleva el link para descargarlo. Si la subida falla (o la página se abre
     desde la computadora sin internet), se vuelve a lo de antes: el cliente
     adjunta el archivo a mano en el chat. */
  var CLIENTE_BLOB = 'https://esm.sh/@vercel/blob@2.8.2/client';
  var TIPOS = {
    stl: 'model/stl', obj: 'model/obj', '3mf': 'model/3mf', step: 'model/step', stp: 'model/step',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
    heic: 'image/heic', heif: 'image/heif'
  };
  var EXT_3D = ['stl', 'obj', '3mf', 'step', 'stp'];
  var subidas = { stl: null, idea: null };
  var promesaCliente = null;

  function extension(nombre) {
    var partes = String(nombre).toLowerCase().split('.');
    return partes.length > 1 ? partes.pop() : '';
  }
  function nombreSeguro(nombre) {
    var ext = extension(nombre);
    var base = String(nombre).replace(/\.[^.]*$/, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'archivo';
    return base + '.' + ext;
  }
  function codigoAlAzar() {
    var bytes = new Uint8Array(10);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function subidaActivada() {
    return (cfg.stl.subirArchivos !== false) && /^https?:$/.test(location.protocol);
  }
  function maximoBytes() { return (cfg.stl.tamanoMaximoMB || 25) * 1024 * 1024; }

  function mostrarEstado(tipo) {
    var el = $(tipo === 'idea' ? '#imagenEstado' : '#archivoEstado');
    var s = subidas[tipo];
    if (el) {
      if (!s) { el.textContent = ''; el.removeAttribute('data-estado'); }
      else {
        el.setAttribute('data-estado', s.estado);
        el.textContent = s.estado === 'subiendo' ? 'Subiendo… ' + s.porcentaje + '%'
          : s.estado === 'lista' ? '✓ Subido. Ya podés enviarlo por WhatsApp.'
          : 'No se pudo subir. Lo vas a poder adjuntar en el chat de WhatsApp.';
      }
    }
    actualizarBoton();
  }
  function actualizarBoton() {
    if (!botonEnviar) return;
    var s = subidas[modo];
    var ocupado = !!(s && s.estado === 'subiendo');
    botonEnviar.disabled = ocupado;
    botonEnviar.setAttribute('aria-busy', ocupado ? 'true' : 'false');
  }

  function subirArchivo(tipo, archivo) {
    if (!subidaActivada()) { subidas[tipo] = null; mostrarEstado(tipo); return; }
    var s = { archivo: archivo, estado: 'subiendo', porcentaje: 0, url: '' };
    subidas[tipo] = s;
    mostrarEstado(tipo);
    var ext = extension(archivo.name);
    if (!promesaCliente) promesaCliente = import(CLIENTE_BLOB);
    promesaCliente.then(function (cliente) {
      // El código al azar hace que el link del archivo no se pueda adivinar
      return cliente.uploadPresigned('pedidos/' + codigoAlAzar() + '-' + nombreSeguro(archivo.name), archivo, {
        access: 'public',
        handleUploadUrl: '/api/subir',
        contentType: TIPOS[ext] || archivo.type,
        onUploadProgress: function (p) {
          if (subidas[tipo] !== s) return;
          s.porcentaje = Math.min(99, Math.round(p.percentage || 0));
          mostrarEstado(tipo);
        }
      });
    }).then(function (blob) {
      if (subidas[tipo] !== s) return; // el cliente cambió el archivo mientras subía
      s.estado = 'lista';
      // El almacenamiento es privado: el link pasa por /api/archivo, que da permiso de descarga
      s.url = location.origin + '/api/archivo?f=' + encodeURIComponent(blob.pathname);
      mostrarEstado(tipo);
    }).catch(function (err) {
      if (subidas[tipo] !== s) return;
      if (window.console) console.warn('No se pudo subir el archivo:', err);
      promesaCliente = null; // permite reintentar con otro archivo
      s.estado = 'error';
      mostrarEstado(tipo);
    });
  }
  function linkSubido(tipo) {
    var s = subidas[tipo];
    return s && s.estado === 'lista' ? s.url : '';
  }

  /* Modo del formulario: "stl" (archivo 3D) o "idea" (foto o boceto) */
  function cambiarModo(nuevo) {
    modo = nuevo;
    form.setAttribute('data-modo', nuevo);
    $$('[data-solo]', form).forEach(function (el) { el.hidden = el.getAttribute('data-solo') !== nuevo; });
    $('#resultadoSTL').hidden = true;
    mostrarErrorImagen('');
    actualizarBoton();
  }

  function mostrarErrorImagen(texto) {
    var err = $('#idea-error-imagen');
    if (!err) return;
    err.textContent = texto;
    err.closest('.campo').classList.toggle('invalido', !!texto);
  }

  function mostrarImagen(imagen) {
    var caja = $('#imagenElegida'), zonaIdea = $('#zonaIdea');
    if (urlVista) { URL.revokeObjectURL(urlVista); urlVista = null; }
    if (imagen) {
      urlVista = URL.createObjectURL(imagen);
      $('#imagenVista').src = urlVista;
      $('#imagenNombre').textContent = imagen.name;
      $('#imagenPeso').textContent = pesoArchivo(imagen.size);
    } else {
      $('#imagenVista').removeAttribute('src');
    }
    caja.hidden = !imagen;
    zonaIdea.hidden = !!imagen;
  }

  function elegirImagen(imagen) {
    if (!imagen) return;
    var esImagen = /^image\//.test(imagen.type) || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(imagen.name);
    if (!esImagen) { mostrarErrorImagen('Ese archivo no es una imagen. Elegí un PNG, JPG o WEBP.'); return; }
    if (imagen.size > maximoBytes()) { mostrarErrorImagen('La imagen pesa más de ' + (cfg.stl.tamanoMaximoMB || 25) + ' MB. Elegí una más liviana.'); return; }
    // A diferencia del STL, no redirige enseguida: primero se completan los datos de la idea
    imagenActual = imagen;
    mostrarErrorImagen('');
    mostrarImagen(imagen);
    $('#resultadoSTL').hidden = true;
    subirArchivo('idea', imagen);
  }

  function mostrarArchivo(archivo) {
    var caja = $('#archivoElegido');
    if (archivo) {
      $('#archivoNombre').textContent = archivo.name;
      $('#archivoPeso').textContent = pesoArchivo(archivo.size);
      caja.hidden = false;
      zona.hidden = true;
    } else {
      caja.hidden = true;
      zona.hidden = false;
    }
  }

  function mensajeCotizacion() {
    var nombre = ($('#stlNombre') ? $('#stlNombre').value.trim() : '');
    var email = ($('#stlEmail') ? $('#stlEmail').value.trim() : '');
    var mat = ($('#stlMaterial') ? $('#stlMaterial').value : '');
    var color = ($('#stlColor') ? $('#stlColor').value : '');
    var medidas = ($('#stlMedidas') ? $('#stlMedidas').value.trim() : '');
    var desc = ($('#stlDescripcion') ? $('#stlDescripcion').value.trim() : '');

    var lineas = [
      'Hola Rasho Prints! Quiero compartirles mi archivo 3D para cotizar e imprimir:',
      ''
    ];
    if (archivoActual) {
      lineas.push('📁 Archivo: ' + archivoActual.name + ' (' + pesoArchivo(archivoActual.size) + ')');
      if (linkSubido('stl')) lineas.push('⬇️ Descargar: ' + linkSubido('stl'));
    }
    if (mat) lineas.push('Material: ' + mat);
    if (color) lineas.push('Color: ' + color);
    if (medidas) lineas.push('Dimensiones / cantidad: ' + medidas);
    if (nombre) lineas.push('Nombre: ' + nombre);
    if (email) lineas.push('Email: ' + email);
    if (desc) lineas.push('Aclaraciones: ' + desc);
    lineas.push('');
    lineas.push(linkSubido('stl') ? 'Pueden descargar el archivo desde el link.' : 'Te adjunto el archivo en este chat para que lo revisen.');
    return lineas.join('\n');
  }

  function mensajeIdea() {
    var nombre = $('#stlNombre').value.trim();
    var email = $('#stlEmail').value.trim();
    var idea = $('#ideaDescripcion').value.trim();
    var medidas = $('#ideaMedidas').value.trim();
    var cantidad = parseInt($('#ideaCantidad').value, 10);

    var lineas = [
      'Hola Rasho Prints! No tengo un archivo 3D, pero tengo una idea que me gustaría fabricar:',
      ''
    ];
    if (imagenActual) lineas.push('🖼️ Imagen de referencia: ' + imagenActual.name + ' (' + pesoArchivo(imagenActual.size) + ')');
    if (imagenActual && linkSubido('idea')) lineas.push('⬇️ Ver imagen: ' + linkSubido('idea'));
    if (idea) lineas.push('Idea: ' + idea);
    if (medidas) lineas.push('Medidas aproximadas: ' + medidas);
    lineas.push('Cantidad de piezas: ' + (cantidad > 0 ? cantidad : 1));
    // Solo se envía lo que el cliente eligió; "A definir" (valor vacío) no se incluye
    if ($('#ideaUso').value) lineas.push('Uso: ' + $('#ideaUso').value);
    if ($('#stlMaterial').value) lineas.push('Material: ' + $('#stlMaterial').value);
    if ($('#stlColor').value) lineas.push('Color: ' + $('#stlColor').value);
    if (nombre) lineas.push('Nombre: ' + nombre);
    if (email) lineas.push('Email: ' + email);
    lineas.push('');
    lineas.push(imagenActual && !linkSubido('idea') ? 'Te adjunto la imagen en este chat.' : '¿Me ayudan a diseñarla y cotizarla?');
    return lineas.join('\n');
  }

  function redirigirAWhatsApp() {
    var esIdea = modo === 'idea';
    var url = enlaceWhatsApp(esIdea ? mensajeIdea() : mensajeCotizacion());
    var reabrir = $('#reabrirWhatsSTL');
    if (reabrir) reabrir.href = url;
    var resArchivo = $('#resultadoArchivo');
    var adjunto = esIdea ? imagenActual : archivoActual;
    if (resArchivo) resArchivo.textContent = adjunto ? adjunto.name : (esIdea ? 'de tu idea, si la tenés' : 'tu archivo');
    var conLink = !!(adjunto && linkSubido(esIdea ? 'idea' : 'stl'));
    $$('.paso-link', form).forEach(function (el) { el.hidden = !conLink; });
    $$('.paso-adjuntar', form).forEach(function (el) {
      var solo = el.getAttribute('data-solo');
      el.hidden = conLink || (!!solo && solo !== modo) || (esIdea && !adjunto);
    });
    var res = $('#resultadoSTL');
    if (res) {
      res.hidden = false;
      try { res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }
    abrirWhatsApp(url);
  }

  function errorArchivo(texto) {
    var err = $('#stl-error-archivo');
    if (!err) return;
    err.textContent = texto;
    err.closest('.campo').classList.toggle('invalido', !!texto);
  }

  function elegirArchivo(archivo) {
    if (!archivo) return;
    if (EXT_3D.indexOf(extension(archivo.name)) === -1) {
      errorArchivo('Ese formato no está permitido. Elegí un archivo STL, OBJ, 3MF o STEP.');
      entradaArchivo.value = '';
      return;
    }
    if (archivo.size > maximoBytes()) {
      errorArchivo('El archivo pesa más de ' + (cfg.stl.tamanoMaximoMB || 25) + ' MB. Escribinos por WhatsApp y lo resolvemos.');
      entradaArchivo.value = '';
      return;
    }
    errorArchivo('');
    archivoActual = archivo;
    mostrarArchivo(archivo);
    $('#resultadoSTL').hidden = true;
    // Se sube enseguida; el cliente completa los datos y después envía por WhatsApp
    subirArchivo('stl', archivo);
  }

  if (form) {
    entradaArchivo.addEventListener('change', function () {
      if (entradaArchivo.files && entradaArchivo.files[0]) {
        elegirArchivo(entradaArchivo.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) { e.preventDefault(); zona.classList.add('arrastrando'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) { e.preventDefault(); zona.classList.remove('arrastrando'); });
    });
    zona.addEventListener('drop', function (e) {
      e.preventDefault();
      zona.classList.remove('arrastrando');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) elegirArchivo(f);
    });

    $('#quitarArchivo').addEventListener('click', function () {
      archivoActual = null;
      entradaArchivo.value = '';
      subidas.stl = null;
      mostrarEstado('stl');
      mostrarArchivo(null);
      $('#resultadoSTL').hidden = true;
      entradaArchivo.focus();
    });

    // Colores del selector STL
    var selColor = $('#stlColor');
    if (selColor) {
      selColor.innerHTML = '<option value="" selected>A definir</option>' + Object.keys(cfg.colores).map(function (k) {
        return '<option value="' + escapar(cfg.colores[k].nombre) + '">' + escapar(cfg.colores[k].nombre) + '</option>';
      }).join('') + '<option value="Otro (lo detallo en WhatsApp)">Otro (lo detallo en WhatsApp)</option>';
    }

    // Selector de modo
    $$('input[name="modo"]', form).forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) cambiarModo(r.value); });
    });

    // Botones de la portada: llevan al formulario con el modo ya elegido
    $$('[data-ir-modo]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var radio = $('input[name="modo"][value="' + a.getAttribute('data-ir-modo') + '"]', form);
        if (radio && !radio.checked) { radio.checked = true; cambiarModo(radio.value); }
        // Lleva directo al recuadro para subir la imagen o el archivo (no al título de la sección)
        var destino = $('.campo--subir[data-solo="' + modo + '"]', form);
        if (destino) {
          e.preventDefault();
          destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var zonaDestino = $('.soltar', destino);
          if (zonaDestino) zonaDestino.classList.add('soltar--destacada');
          setTimeout(function () { if (zonaDestino) zonaDestino.classList.remove('soltar--destacada'); }, 1800);
        }
      });
    });

    // Imagen de la idea
    var entradaImagen = $('#archivoIdea'), zonaIdea = $('#zonaIdea');
    entradaImagen.addEventListener('change', function () {
      if (entradaImagen.files && entradaImagen.files[0]) elegirImagen(entradaImagen.files[0]);
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      zonaIdea.addEventListener(ev, function (e) { e.preventDefault(); zonaIdea.classList.add('arrastrando'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zonaIdea.addEventListener(ev, function (e) { e.preventDefault(); zonaIdea.classList.remove('arrastrando'); });
    });
    zonaIdea.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) elegirImagen(f);
    });
    $('#ideaDescripcion').addEventListener('input', function () { mostrarErrorImagen(''); });
    $('#quitarImagen').addEventListener('click', function () {
      imagenActual = null;
      entradaImagen.value = '';
      subidas.idea = null;
      mostrarEstado('idea');
      mostrarImagen(null);
      $('#resultadoSTL').hidden = true;
      entradaImagen.focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (modo === 'idea') {
        // Hace falta al menos la imagen o una descripción de la idea
        if (!imagenActual && !$('#ideaDescripcion').value.trim()) {
          mostrarErrorImagen('Subí una imagen o contanos tu idea para poder enviarla.');
          entradaImagen.focus();
          return;
        }
        redirigirAWhatsApp();
        return;
      }
      if (!archivoActual) {
        entradaArchivo.click();
        return;
      }
      redirigirAWhatsApp();
    });
  }

  /* =========================================================
     INICIO
     ========================================================= */
  aplicarContacto();
  observarSecciones();
  animacionIdea();
  activarFocos();
})();
