/* =====================================================================
   RASHO PRINTS — SHOWCASE DE PRECISIÓN Y SCROLLYTELLING (ESTILO APPLE XDR)
   Transiciones cinemáticas impulsadas por scroll y renderizador 3D interactivo.
   ===================================================================== */
(function () {
  'use strict';

  var track = document.getElementById('xdrTrack');
  var canvas = document.getElementById('xdrCanvas');
  var barra = document.getElementById('barra');
  if (!track || !canvas) return;

  var ctx = canvas.getContext('2d');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.xdr-slide'));
  var navBtns = Array.prototype.slice.call(document.querySelectorAll('.xdr-nav__btn'));
  var progressBar = document.getElementById('xdrBarraProgreso');
  var counterEl = document.getElementById('xdrContador');
  var glowEl = document.getElementById('xdrGlow');

  // HUD de telemetría
  var faseEl = document.getElementById('xdrFase');
  var zPosEl = document.getElementById('xdrZPos');
  var coreEl = document.getElementById('xdrCore');
  var tempEl = document.getElementById('xdrTemp');

  // Estado de scroll e interpolación
  var currentProgress = 0;
  var targetProgress = 0;
  var isVisible = false;
  var animFrameId = null;

  // Parallax interactivo del mouse
  var mouseX = 0;
  var mouseY = 0;
  var targetMouseX = 0;
  var targetMouseY = 0;

  // Detección de movimiento reducido
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Medición de scroll con respecto al track ---------- */
  function calcularTargetProgress() {
    var rect = track.getBoundingClientRect();
    var viewportH = window.innerHeight;
    var totalScroll = rect.height - viewportH;
    if (totalScroll <= 0) return 0;

    var scrolled = -rect.top;
    var p = scrolled / totalScroll;
    return Math.max(0, Math.min(1, p));
  }

  function onScroll() {
    targetProgress = calcularTargetProgress();

    // Adaptación dinámica de la barra de navegación a modo oscuro
    if (barra) {
      var rect = track.getBoundingClientRect();
      var barraH = barra.offsetHeight || 64;
      var enShowcase = rect.top <= barraH && rect.bottom >= barraH + 50;
      barra.classList.toggle('barra--oscura', enShowcase);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    ajustarCanvas();
    targetProgress = calcularTargetProgress();
  }, { passive: true });

  /* ---------- Interacción con mouse (parallax 3D) ---------- */
  track.addEventListener('mousemove', function (e) {
    var rect = track.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    targetMouseX = (e.clientX - cx) / (rect.width / 2);
    targetMouseY = (e.clientY - cy) / (rect.height / 2);
  }, { passive: true });

  track.addEventListener('mouseleave', function () {
    targetMouseX = 0;
    targetMouseY = 0;
  });

  /* ---------- Navegación por capítulos con click ---------- */
  var chapterPoints = [0.06, 0.34, 0.60, 0.88];
  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var step = parseInt(btn.getAttribute('data-step'), 10) || 0;
      var targetP = chapterPoints[step] || 0;
      var rect = track.getBoundingClientRect();
      var totalScroll = rect.height - window.innerHeight;
      var trackTopAbs = window.pageYOffset + rect.top;
      var dest = trackTopAbs + targetP * totalScroll;

      window.scrollTo({
        top: dest,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* ---------- Transición continua de textos estilo Apple ---------- */
  function getSlideState(p, idx) {
    // Retorna { opacity, y, blur }
    if (idx === 0) {
      if (p <= 0.18) return { opacity: 1, y: 0, blur: 0 };
      if (p <= 0.26) {
        var t = (p - 0.18) / 0.08;
        return { opacity: 1 - t, y: -28 * t, blur: 5 * t };
      }
      return { opacity: 0, y: -28, blur: 5 };
    }
    if (idx === 1) {
      if (p < 0.20) return { opacity: 0, y: 28, blur: 5 };
      if (p <= 0.27) {
        var t = (p - 0.20) / 0.07;
        return { opacity: t, y: 28 * (1 - t), blur: 5 * (1 - t) };
      }
      if (p <= 0.44) return { opacity: 1, y: 0, blur: 0 };
      if (p <= 0.52) {
        var t = (p - 0.44) / 0.08;
        return { opacity: 1 - t, y: -28 * t, blur: 5 * t };
      }
      return { opacity: 0, y: -28, blur: 5 };
    }
    if (idx === 2) {
      if (p < 0.46) return { opacity: 0, y: 28, blur: 5 };
      if (p <= 0.53) {
        var t = (p - 0.46) / 0.07;
        return { opacity: t, y: 28 * (1 - t), blur: 5 * (1 - t) };
      }
      if (p <= 0.70) return { opacity: 1, y: 0, blur: 0 };
      if (p <= 0.78) {
        var t = (p - 0.70) / 0.08;
        return { opacity: 1 - t, y: -28 * t, blur: 5 * t };
      }
      return { opacity: 0, y: -28, blur: 5 };
    }
    if (idx === 3) {
      if (p < 0.72) return { opacity: 0, y: 28, blur: 5 };
      if (p <= 0.80) {
        var t = (p - 0.72) / 0.08;
        return { opacity: t, y: 28 * (1 - t), blur: 5 * (1 - t) };
      }
      return { opacity: 1, y: 0, blur: 0 };
    }
    return { opacity: 0, y: 0, blur: 0 };
  }

  function actualizarTextos(p) {
    var activeIdx = 0;
    if (p >= 0.75) activeIdx = 3;
    else if (p >= 0.48) activeIdx = 2;
    else if (p >= 0.23) activeIdx = 1;

    slides.forEach(function (slide, idx) {
      var state = getSlideState(p, idx);
      slide.style.opacity = state.opacity.toFixed(3);
      slide.style.transform = 'translate3d(0, ' + state.y.toFixed(1) + 'px, 0)';
      if (state.blur > 0.1) {
        slide.style.filter = 'blur(' + state.blur.toFixed(1) + 'px)';
      } else {
        slide.style.filter = 'none';
      }
      slide.style.pointerEvents = state.opacity > 0.4 ? 'auto' : 'none';
      slide.classList.toggle('activo', idx === activeIdx);
    });

    // Actualizar botones de navegación
    navBtns.forEach(function (btn, idx) {
      btn.classList.toggle('activo', idx === activeIdx);
    });

    // Actualizar barra de progreso y contador
    if (progressBar) {
      progressBar.style.width = (p * 100).toFixed(1) + '%';
    }
    if (counterEl) {
      counterEl.textContent = '0' + (activeIdx + 1) + ' / 04';
    }

    // Actualizar HUD de telemetría y glow ambiental
    actualizarTelemetria(p, activeIdx);
  }

  function actualizarTelemetria(p, activeIdx) {
    if (activeIdx === 0) {
      if (faseEl) faseEl.textContent = 'RESOLUCIÓN DE CAPA';
      var z = Math.min(0.08, 0.04 + (p / 0.25) * 0.04).toFixed(2);
      if (zPosEl) zPosEl.textContent = z + ' mm';
      if (coreEl) coreEl.textContent = 'MICRO-EXTRUSIÓN Z';
      if (tempEl) tempEl.textContent = '215 °C';
      if (glowEl) glowEl.style.background = 'radial-gradient(circle at 60% 50%, rgba(255, 90, 31, 0.16) 0%, rgba(0, 180, 255, 0.06) 45%, transparent 70%)';
    } else if (activeIdx === 1) {
      if (faseEl) faseEl.textContent = 'ANÁLISIS 360° CAD';
      if (zPosEl) zPosEl.textContent = 'TOLERANCIA ±0.05 mm';
      if (coreEl) coreEl.textContent = 'VOLADIZO 65° LIBRE';
      if (tempEl) tempEl.textContent = '220 °C';
      if (glowEl) glowEl.style.background = 'radial-gradient(circle at 55% 45%, rgba(0, 210, 255, 0.18) 0%, rgba(30, 60, 120, 0.1) 50%, transparent 75%)';
    } else if (activeIdx === 2) {
      if (faseEl) faseEl.textContent = 'ARQUITECTURA GIROIDAL';
      if (zPosEl) zPosEl.textContent = 'PESO REDUCIDO -60%';
      if (coreEl) coreEl.textContent = 'DISPERSIÓN DE CARGA';
      if (tempEl) tempEl.textContent = '235 °C';
      if (glowEl) glowEl.style.background = 'radial-gradient(circle at 50% 50%, rgba(0, 255, 180, 0.15) 0%, rgba(255, 90, 31, 0.1) 55%, transparent 75%)';
    } else {
      if (faseEl) faseEl.textContent = 'FUSIÓN TÉRMICA MOLECULAR';
      if (zPosEl) zPosEl.textContent = 'ADHESIÓN 100%';
      if (coreEl) coreEl.textContent = 'PETG TÉCNICO';
      if (tempEl) tempEl.textContent = '240 °C ACTIVO';
      if (glowEl) glowEl.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 90, 31, 0.28) 0%, rgba(255, 170, 0, 0.15) 40%, transparent 75%)';
    }
  }

  /* =========================================================
     MOTOR DE RENDERIZADO 3D EN CANVAS (PRECISIÓN HARDWARE)
     ========================================================= */
  var canvasW = 600;
  var canvasH = 500;

  function ajustarCanvas() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = rect.width;
    canvasH = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Generador de geometría 3D industrial: pieza técnica con cilindros, aletas, orificios y núcleo giroidal
  var modelo = (function () {
    var capas = [];
    var totalCapas = 64;
    var alto = 180;
    var pasoY = alto / totalCapas;

    for (var i = 0; i < totalCapas; i++) {
      var y = -alto / 2 + i * pasoY;
      var ny = i / totalCapas; // 0 a 1
      var radio;

      // Perfil geométrico de pieza técnica mecanizada
      if (ny < 0.12) {
        // Base hexagonal ensanchada con soporte
        radio = 72;
      } else if (ny < 0.22) {
        // Cuello cónico de transición
        radio = 72 - (ny - 0.12) * 200;
      } else if (ny < 0.70) {
        // Cuerpo estriado con nervios de disipación
        var estria = Math.sin((ny - 0.22) * Math.PI * 8);
        radio = 52 + estria * 4.5;
      } else if (ny < 0.85) {
        // Corona cónica ascendente
        radio = 50 + (ny - 0.70) * 120;
      } else {
        // Brida superior con reborde
        radio = 68;
      }

      // Puntos del contorno (16 vértices por anillo)
      var puntos = [];
      var numPts = 24;
      for (var j = 0; j < numPts; j++) {
        var theta = (j / numPts) * Math.PI * 2;
        var r = radio;
        // Hexágono sutil en la base
        if (ny < 0.12) {
          var modH = Math.cos(theta * 6);
          r += modH * 3.5;
        }
        puntos.push({
          x: Math.cos(theta) * r,
          y: y,
          z: Math.sin(theta) * r
        });
      }
      capas.push({ y: y, puntos: puntos, radio: radio, ny: ny });
    }

    // Puntos de la estructura interna giroidal (superficie mínima 3D)
    var gyroidPuntos = [];
    var gLattice = [];
    var gCount = 8;
    for (var ix = -3; ix <= 3; ix++) {
      for (var iy = -4; iy <= 4; iy++) {
        for (var iz = -3; iz <= 3; iz++) {
          var gx = (ix / 3) * Math.PI * 1.8;
          var gy = (iy / 4) * Math.PI * 2.2;
          var gz = (iz / 3) * Math.PI * 1.8;
          // Ecuación de superficie mínima de Gyroid: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0
          var val = Math.sin(gx) * Math.cos(gy) + Math.sin(gy) * Math.cos(gz) + Math.sin(gz) * Math.cos(gx);
          if (Math.abs(val) < 0.45) {
            var rx = ix * 14;
            var ry = iy * 18;
            var rz = iz * 14;
            var distSq = rx * rx + rz * rz;
            if (distSq < 42 * 42) {
              gyroidPuntos.push({ x: rx, y: ry, z: rz, phase: (ix + iy + iz) });
            }
          }
        }
      }
    }

    // Conectar nodos giroidales cercanos
    for (var a = 0; a < gyroidPuntos.length; a++) {
      for (var b = a + 1; b < gyroidPuntos.length; b++) {
        var dx = gyroidPuntos[a].x - gyroidPuntos[b].x;
        var dy = gyroidPuntos[a].y - gyroidPuntos[b].y;
        var dz = gyroidPuntos[a].z - gyroidPuntos[b].z;
        var d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 24 * 24 && d2 > 8 * 8) {
          gLattice.push([a, b]);
        }
      }
    }

    return { capas: capas, gyroid: gyroidPuntos, lattice: gLattice };
  })();

  // Proyección 3D en perspectiva con centro ajustable
  function proyectar(pt, rotX, rotY, cx, cy, fov, escala) {
    var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    var x1 = pt.x * cosY + pt.z * sinY;
    var z1 = -pt.x * sinY + pt.z * cosY;

    var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    var y2 = pt.y * cosX - z1 * sinX;
    var z2 = pt.y * sinX + z1 * cosX;

    var dist = fov + z2;
    if (dist <= 15) dist = 15;
    var f = (fov / dist) * escala;
    return {
      x: cx + x1 * f,
      y: cy + y2 * f,
      z: z2,
      f: f
    };
  }

  // Tiempo continuo para animaciones de boquilla, luz y ondas
  var tiempo = 0;

  function dibujar(p) {
    ctx.clearRect(0, 0, canvasW, canvasH);

    var cx = canvasW * 0.5;
    var cy = canvasH * 0.52;
    var fov = 420;
    var escala = Math.min(canvasW, canvasH) / 340;

    // Ángulos de rotación 3D dinámicos según progreso y mouse
    var rotXBase = -0.38 + p * 0.15; // Vista isométrica inclinada
    var rotYBase = 0.55 + p * Math.PI * 1.85; // Giro continuo en scroll
    var rotX = rotXBase + mouseY * 0.22;
    var rotY = rotYBase + mouseX * 0.35;

    // Fases del showcase:
    // Fase 0 (0.00 - 0.25): Construcción capa por capa + boquilla láser
    // Fase 1 (0.25 - 0.50): Geometría 360° + cotas HUD de precisión
    // Fase 2 (0.50 - 0.75): Carcasa traslúcida + estructura giroidal interna
    // Fase 3 (0.75 - 1.00): Mapa térmico molecular 240 °C + partículas

    // ---------- BASE: BANDEJA DE IMPRESIÓN MECANIZADA ----------
    dibujarBandeja(rotX, rotY, cx, cy, fov, escala, p);

    // ---------- RENDERIZADO DEL OBJETO 3D ----------
    if (p < 0.25) {
      // FASE 0: Capas crecientes + boquilla de extrusión activa
      renderFaseCapas(p, rotX, rotY, cx, cy, fov, escala);
    } else if (p < 0.50) {
      // FASE 1: Modelo completo en giro 360° + cotas tridimensionales
      var subP = (p - 0.25) / 0.25;
      renderFaseGeometria(subP, rotX, rotY, cx, cy, fov, escala);
    } else if (p < 0.75) {
      // FASE 2: X-Ray con celosía giroidal 3D
      var subP = (p - 0.50) / 0.25;
      renderFaseGiroidal(subP, rotX, rotY, cx, cy, fov, escala);
    } else {
      // FASE 3: Fusión térmica molecular incandescente
      var subP = (p - 0.75) / 0.25;
      renderFaseTermica(subP, rotX, rotY, cx, cy, fov, escala);
    }
  }

  /* ---------- Bandeja de impresión reflectiva ---------- */
  function dibujarBandeja(rotX, rotY, cx, cy, fov, escala, p) {
    var radioBandeja = 110;
    var yBase = 92;
    var numPts = 32;

    ctx.save();
    ctx.beginPath();
    for (var i = 0; i <= numPts; i++) {
      var th = (i / numPts) * Math.PI * 2;
      var pt = proyectar({ x: Math.cos(th) * radioBandeja, y: yBase, z: Math.sin(th) * radioBandeja }, rotX, rotY, cx, cy, fov, escala);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(20, 20, 26, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rejilla técnica concéntrica en la cama de impresión
    [40, 75].forEach(function (r) {
      ctx.beginPath();
      for (var j = 0; j <= 24; j++) {
        var th2 = (j / 24) * Math.PI * 2;
        var pt2 = proyectar({ x: Math.cos(th2) * r, y: yBase, z: Math.sin(th2) * r }, rotX, rotY, cx, cy, fov, escala);
        if (j === 0) ctx.moveTo(pt2.x, pt2.y);
        else ctx.lineTo(pt2.x, pt2.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 90, 31, 0.18)';
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ---------- FASE 0: Capa por capa con boquilla y haz láser ---------- */
  function renderFaseCapas(p, rotX, rotY, cx, cy, fov, escala) {
    var capas = modelo.capas;
    var tFase = p / 0.25; // 0 -> 1
    var numCapasVisibles = Math.max(3, Math.floor(tFase * capas.length));
    var capaActivaIdx = Math.min(capas.length - 1, numCapasVisibles - 1);

    // Dibujar capas impresas desde la base hacia arriba
    for (var i = 0; i < numCapasVisibles; i++) {
      var c = capas[i];
      var esUltima = (i === capaActivaIdx);

      ctx.beginPath();
      var ptsProy = [];
      for (var j = 0; j < c.puntos.length; j++) {
        var pt = proyectar(c.puntos[j], rotX, rotY, cx, cy, fov, escala);
        ptsProy.push(pt);
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (esUltima) {
        // Capa activa: resplandor naranja Rasho intenso
        ctx.fillStyle = 'rgba(255, 90, 31, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#ff5a1f';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff5a1f';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Capas solidificadas: tonos metálicos gris grafito con borde sutil
        var alpha = 0.25 + (i / capas.length) * 0.45;
        ctx.fillStyle = 'rgba(18, 20, 24, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(220, 225, 235, ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Conectar perfiles verticales sutiles
    conectarPerfilesVerticales(numCapasVisibles, rotX, rotY, cx, cy, fov, escala, 'rgba(255, 255, 255, 0.08)');

    // Boquilla de extrusión animada en la capa activa
    var cAct = capas[capaActivaIdx];
    var angNozzle = (tiempo * 2.8) % (Math.PI * 2);
    var nozzlePt3D = {
      x: Math.cos(angNozzle) * cAct.radio,
      y: cAct.y,
      z: Math.sin(angNozzle) * cAct.radio
    };
    var nPt = proyectar(nozzlePt3D, rotX, rotY, cx, cy, fov, escala);

    // Haz de haz de luz / láser de inspección
    ctx.save();
    var grad = ctx.createLinearGradient(nPt.x, nPt.y - 45, nPt.x, nPt.y);
    grad.addColorStop(0, 'rgba(255, 90, 31, 0)');
    grad.addColorStop(1, 'rgba(255, 90, 31, 0.85)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nPt.x, nPt.y - 45);
    ctx.lineTo(nPt.x, nPt.y);
    ctx.stroke();

    // Cabeza de extrusión (cono metálico dorado / latón)
    ctx.beginPath();
    ctx.moveTo(nPt.x, nPt.y);
    ctx.lineTo(nPt.x - 12, nPt.y - 28);
    ctx.lineTo(nPt.x + 12, nPt.y - 28);
    ctx.closePath();
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Punto incandescente en la punta de la boquilla
    ctx.beginPath();
    ctx.arc(nPt.x, nPt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff5a1f';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();

    // Cota de altura Z en tiempo real
    ctx.save();
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ff8a50';
    var labelZ = 'CAPA ' + numCapasVisibles + ' · Z: ' + (cAct.ny * 0.12).toFixed(2) + ' mm';
    ctx.fillText(labelZ, nPt.x + 18, nPt.y - 10);
    ctx.restore();
  }

  /* ---------- FASE 1: Geometría completa con cotas y tolerancia 360° ---------- */
  function renderFaseGeometria(subP, rotX, rotY, cx, cy, fov, escala) {
    var capas = modelo.capas;

    // Renderizar todas las capas sólidas con sombreado de profundidad
    for (var i = 0; i < capas.length; i += 2) {
      var c = capas[i];
      ctx.beginPath();
      for (var j = 0; j < c.puntos.length; j++) {
        var pt = proyectar(c.puntos[j], rotX, rotY, cx, cy, fov, escala);
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 17, 21, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(215, 220, 235, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    conectarPerfilesVerticales(capas.length, rotX, rotY, cx, cy, fov, escala, 'rgba(0, 210, 255, 0.28)');

    // Cotas flotantes en 3D (Tolerancia, Diámetro, Ángulo de voladizo)
    var cMedio = capas[Math.floor(capas.length * 0.55)];
    var ptMedio = proyectar({ x: cMedio.radio + 16, y: cMedio.y, z: 0 }, rotX, rotY, cx, cy, fov, escala);

    ctx.save();
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1;

    // Cota 1: Tolerancia dimensional
    ctx.beginPath();
    ctx.moveTo(ptMedio.x - 6, ptMedio.y - 18);
    ctx.lineTo(ptMedio.x + 8, ptMedio.y - 18);
    ctx.lineTo(ptMedio.x + 8, ptMedio.y + 18);
    ctx.lineTo(ptMedio.x - 6, ptMedio.y + 18);
    ctx.stroke();
    ctx.fillText('[ ±0.05 mm ]', ptMedio.x + 14, ptMedio.y + 4);

    // Cota 2: Voladizo 65°
    var cTop = capas[Math.floor(capas.length * 0.78)];
    var ptTop = proyectar({ x: -cTop.radio - 14, y: cTop.y, z: 0 }, rotX, rotY, cx, cy, fov, escala);
    ctx.fillText('∠ 65° LIBRE', ptTop.x - 84, ptTop.y - 8);
    ctx.beginPath();
    ctx.arc(ptTop.x - 4, ptTop.y - 4, 12, 0, Math.PI * 0.45);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- FASE 2: X-Ray con celosía giroidal 3D ---------- */
  function renderFaseGiroidal(subP, rotX, rotY, cx, cy, fov, escala) {
    var capas = modelo.capas;

    // Carcasa exterior transparente (holograma cian)
    for (var i = 0; i < capas.length; i += 3) {
      var c = capas[i];
      ctx.beginPath();
      for (var j = 0; j < c.puntos.length; j++) {
        var pt = proyectar(c.puntos[j], rotX, rotY, cx, cy, fov, escala);
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 180, 220, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Celosía Giroidal interna en resplandor ámbar / esmeralda
    var gyroid = modelo.gyroid;
    var lattice = modelo.lattice;
    var proyG = [];

    for (var k = 0; k < gyroid.length; k++) {
      proyG.push(proyectar(gyroid[k], rotX, rotY, cx, cy, fov, escala));
    }

    // Dibujar filamentos giroidales continuos
    ctx.save();
    ctx.lineWidth = 1.4;
    for (var l = 0; l < lattice.length; l++) {
      var pA = proyG[lattice[l][0]];
      var pB = proyG[lattice[l][1]];
      if (!pA || !pB) continue;

      // Onda de tensión mecánica animada que viaja por la celosía
      var onda = Math.sin(tiempo * 3 + l * 0.4) * 0.5 + 0.5;
      var gradG = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
      gradG.addColorStop(0, 'rgba(0, 255, 200, ' + (0.35 + onda * 0.4).toFixed(2) + ')');
      gradG.addColorStop(1, 'rgba(255, 140, 40, ' + (0.25 + (1 - onda) * 0.4).toFixed(2) + ')');

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.strokeStyle = gradG;
      ctx.stroke();
    }

    // Nodos estructurales interconectados
    for (var m = 0; m < proyG.length; m += 2) {
      var n = proyG[m];
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- FASE 3: Mapa térmico molecular y fusión 240 °C ---------- */
  function renderFaseTermica(subP, rotX, rotY, cx, cy, fov, escala) {
    var capas = modelo.capas;

    // Gradiente térmico: Base fría (azul cobalto) -> Zona media (magenta) -> Núcleo fundido (naranja 240 °C)
    for (var i = 0; i < capas.length; i += 2) {
      var c = capas[i];
      var ny = c.ny; // 0 (base) a 1 (tope)
      var calor = Math.sin(ny * Math.PI + tiempo * 2) * 0.35 + ny * 0.65;

      var colorTrazo;
      var colorRelleno;
      if (calor > 0.65) {
        // Núcleo activo de fusión 240 °C
        colorTrazo = 'rgba(255, 90, 31, 0.95)';
        colorRelleno = 'rgba(255, 90, 31, 0.22)';
      } else if (calor > 0.35) {
        // Transición térmica
        colorTrazo = 'rgba(168, 85, 247, 0.75)';
        colorRelleno = 'rgba(168, 85, 247, 0.15)';
      } else {
        // Zona enfriada de soporte
        colorTrazo = 'rgba(59, 130, 246, 0.6)';
        colorRelleno = 'rgba(59, 130, 246, 0.1)';
      }

      ctx.beginPath();
      for (var j = 0; j < c.puntos.length; j++) {
        var pt = proyectar(c.puntos[j], rotX, rotY, cx, cy, fov, escala);
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = colorRelleno;
      ctx.fill();
      ctx.strokeStyle = colorTrazo;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    conectarPerfilesVerticales(capas.length, rotX, rotY, cx, cy, fov, escala, 'rgba(255, 120, 50, 0.25)');

    // Anillos térmicos de disipación que irradian desde el centro
    ctx.save();
    for (var a = 0; a < 3; a++) {
      var rOnda = 80 + ((tiempo * 45 + a * 50) % 110);
      var alphaOnda = Math.max(0, 1 - (rOnda - 80) / 110) * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, rOnda, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 90, 31, ' + alphaOnda.toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
    }
    ctx.restore();

    // Partículas térmicas flotantes (chispas sutiles que ascienden)
    ctx.save();
    for (var pIdx = 0; pIdx < 12; pIdx++) {
      var seed = pIdx * 97.3;
      var py = cy + 60 - ((tiempo * 60 + seed) % 180);
      var px = cx + Math.sin(tiempo * 2 + seed) * 75;
      var pAlpha = Math.sin(((cy + 60 - py) / 180) * Math.PI) * 0.85;

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 100, ' + pAlpha.toFixed(2) + ')';
      ctx.shadowColor = '#ff5a1f';
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();
  }

  /* Conectar vértices verticales del modelo para dar cuerpo 3D */
  function conectarPerfilesVerticales(maxCapas, rotX, rotY, cx, cy, fov, escala, color) {
    var capas = modelo.capas;
    var pasoV = 4; // cada 4 vértices
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    for (var j = 0; j < 24; j += pasoV) {
      ctx.beginPath();
      for (var i = 0; i < maxCapas; i += 2) {
        var pt = proyectar(capas[i].puntos[j], rotX, rotY, cx, cy, fov, escala);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* =========================================================
     BUCLE DE ANIMACIÓN A 60/120 FPS CON LERP SUAVE
     ========================================================= */
  var ultimoTiempo = performance.now();

  function loop(ahora) {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    var dt = (ahora - ultimoTiempo) / 1000;
    ultimoTiempo = ahora;
    tiempo += dt;

    // Suavizado Lerp estilo física fluida de Apple
    var lerpFactor = prefersReducedMotion ? 1 : 0.12;
    currentProgress += (targetProgress - currentProgress) * lerpFactor;

    // Suavizado del mouse parallax
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Actualizar slides de texto
    actualizarTextos(currentProgress);

    // Dibujar el modelo 3D en Canvas
    dibujar(currentProgress);

    animFrameId = requestAnimationFrame(loop);
  }

  /* ---------- IntersectionObserver para pausar cuando no está en pantalla ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameId) {
          ajustarCanvas();
          targetProgress = calcularTargetProgress();
          currentProgress = targetProgress;
          ultimoTiempo = performance.now();
          animFrameId = requestAnimationFrame(loop);
        }
      });
    }, { rootMargin: '100px 0px 100px 0px' });

    io.observe(track);
  } else {
    isVisible = true;
    ajustarCanvas();
    animFrameId = requestAnimationFrame(loop);
  }

  // Inicialización inmediata
  ajustarCanvas();
  onScroll();
})();
