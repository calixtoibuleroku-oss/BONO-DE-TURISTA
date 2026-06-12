/* ============================================================
   MAIN.JS — Lógica completa del sitio Bono de Turista
   Módulos: Nav · Estadísticas · QR · Modal · Chatbot · Contacto
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MÓDULO 1: NAVBAR
   ───────────────────────────────────────── */
const Nav = (() => {
  const nav   = document.getElementById('navPdre');
  const coco  = document.getElementById('coco');
  const lista = document.querySelector('.nav-lista');
  const btnBono     = document.getElementById('btnBono');
  const btnHero     = document.getElementById('contenedorBono');

  // Scroll → clase nav-scroll
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('nav-scroll', window.scrollY > 60);
  }, { passive: true });

  // Hamburguesa
  coco?.addEventListener('click', () => {
    const abierto = lista.classList.toggle('menu-abierto');
    coco.classList.toggle('abierto', abierto);
    coco.setAttribute('aria-expanded', abierto);
    document.body.style.overflow = abierto ? 'hidden' : '';
  });
  // Cerrar menú al pulsar un enlace
  lista?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      lista.classList.remove('menu-abierto');
      coco?.classList.remove('abierto');
      document.body.style.overflow = '';
    });
  });

  // Botones del nav abren el modal
  const abrirModal = () => Modal.abrir();
  btnBono?.addEventListener('click', abrirModal);
  btnHero?.addEventListener('click', abrirModal);

  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 2: GENERADOR DE QR
   ───────────────────────────────────────── */
const QRGen = (() => {
  /**
   * Genera un SVG de código QR simplificado usando un patrón de módulos
   * basado en el texto recibido (pseudo-QR visual para demostración).
   */
  function generarSVG(texto, size = 200) {
    const celdas = 21;
    const modulo = Math.floor(size / celdas);
    const offset = Math.floor((size - modulo * celdas) / 2);

    // Semilla determinista a partir del texto
    let semilla = 0;
    for (let i = 0; i < texto.length; i++) {
      semilla = (semilla * 31 + texto.charCodeAt(i)) >>> 0;
    }

    function pseudoRnd() {
      semilla ^= semilla << 13;
      semilla ^= semilla >> 17;
      semilla ^= semilla << 5;
      return (semilla >>> 0) % 2;
    }

    // Patrones fijos de posición (esquinas)
    const patronPos = (grilla, r, c) => {
      for (let dr = 0; dr < 7; dr++) {
        for (let dc = 0; dc < 7; dc++) {
          const borde = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const centro = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          grilla[r + dr][c + dc] = (borde || centro) ? 1 : 0;
        }
      }
    };

    const grilla = Array.from({ length: celdas }, () => Array(celdas).fill(null));
    patronPos(grilla, 0, 0);
    patronPos(grilla, 0, celdas - 7);
    patronPos(grilla, celdas - 7, 0);

    // Rellenar celdas libres con pseudo-aleatorio
    for (let r = 0; r < celdas; r++) {
      for (let c = 0; c < celdas; c++) {
        if (grilla[r][c] === null) grilla[r][c] = pseudoRnd();
      }
    }

    // Construir SVG
    let rects = '';
    for (let r = 0; r < celdas; r++) {
      for (let c = 0; c < celdas; c++) {
        if (grilla[r][c] === 1) {
          const x = offset + c * modulo;
          const y = offset + r * modulo;
          rects += `<rect x="${x}" y="${y}" width="${modulo}" height="${modulo}" fill="#0a3d2e"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="white"/>
      ${rects}
    </svg>`;
  }

  function insertar(contenedor, texto, size = 200) {
    if (!contenedor) return;
    contenedor.innerHTML = generarSVG(texto, size);
    // Añadir línea de escaneo
    const linea = document.createElement('div');
    linea.className = 'qr-scan-line';
    contenedor.style.position = 'relative';
    contenedor.style.overflow = 'hidden';
    contenedor.appendChild(linea);
  }

  return { insertar, generarSVG };
})();


/* ─────────────────────────────────────────
   MÓDULO 3: ESTADÍSTICAS ANIMADAS
   ───────────────────────────────────────── */
const Estadisticas = (() => {
  function animarContador(el, destino, sufijo = '', duracion = 1800) {
    const inicio = performance.now();
    const step = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const ease = 1 - Math.pow(1 - progreso, 3); // easeOutCubic
      const valor = Math.round(ease * destino);
      el.textContent = valor.toLocaleString('es-ES');
      if (sufijo) {
        const hermano = el.nextElementSibling;
        if (hermano && hermano.textContent !== sufijo) hermano.textContent = sufijo;
      }
      if (progreso < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function iniciar() {
    const datos = [
      { selector: '.num-estad',                valor: 2500, sufijo: '€' },
      { selector: '.num-stad:nth-of-type(1)',  valor: 50,   sufijo: '+' },
      { selector: '.num-stad:nth-of-type(2)',  valor: 5,    sufijo: '' },
      { selector: '.num-stad:nth-of-type(3)',  valor: 24,   sufijo: 'h' },
    ];

    // Obtener todos los contadores por atributo
    document.querySelectorAll('[num-targeta], [num-tarjeta]').forEach(el => {
      const destino = parseInt(el.getAttribute('num-targeta') || el.getAttribute('num-tarjeta'), 10);
      if (!isNaN(destino)) animarContador(el, destino);
    });
  }

  // Observador para disparar al entrar en viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        iniciar();
        observer.disconnect();
      }
    });
  }, { threshold: .3 });

  const seccion = document.querySelector('.estadistica-padre');
  if (seccion) observer.observe(seccion);

  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 4: VALIDACIÓN DE FORMULARIOS
   ───────────────────────────────────────── */
const Validacion = (() => {
  const REGLAS = {
    requerido:  val => val.trim().length > 0,
    email:      val => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()),
    telefono:   val => /^[\+]?[\d\s\-\(\)]{7,16}$/.test(val.trim()),
    nombre:     val => val.trim().length >= 2 && /^[A-Za-zÀ-ÿ\s'\-\.]+$/.test(val.trim()),
    fecha:      val => val.trim().length > 0 && !isNaN(Date.parse(val)),
    url:        val => val.trim() === '' || /^https?:\/\/.+/.test(val.trim()),
    select:     val => val.trim() !== '',
    texto:      val => val.trim().length >= 3,
  };

  const MENSAJES = {
    requerido: 'Este campo es obligatorio.',
    email:     'Introduce un correo electrónico válido.',
    telefono:  'Introduce un teléfono válido (ej: +240 222-807-696).',
    nombre:    'El nombre debe tener al menos 2 caracteres y solo letras.',
    fecha:     'Selecciona una fecha válida.',
    url:       'Introduce una URL válida (ej: https://mi-sitio.com).',
    select:    'Selecciona una opción.',
    texto:     'Este campo debe tener al menos 3 caracteres.',
  };

  function obtenerMensajeError(campo) {
    const msj = campo.closest('.grupo-formulario, [class*="grupo\'formulario"]')
      ?.querySelector('.mensaje-error');
    return msj;
  }

  function mostrarError(campo, mensaje) {
    campo.classList.remove('campo-valido');
    campo.classList.add('campo-error');
    const msj = obtenerMensajeError(campo);
    if (msj) {
      msj.textContent = mensaje;
      msj.classList.add('visible');
    }
  }

  function mostrarValido(campo) {
    campo.classList.remove('campo-error');
    campo.classList.add('campo-valido');
    const msj = obtenerMensajeError(campo);
    if (msj) {
      msj.textContent = '';
      msj.classList.remove('visible');
    }
  }

  function limpiar(campo) {
    campo.classList.remove('campo-error', 'campo-valido');
    const msj = obtenerMensajeError(campo);
    if (msj) {
      msj.textContent = '';
      msj.classList.remove('visible');
    }
  }

  function inyectarMensajesError(form) {
    form.querySelectorAll('.grupo-formulario, [class*="grupo\'formulario"]').forEach(grupo => {
      if (!grupo.querySelector('.mensaje-error')) {
        const div = document.createElement('div');
        div.className = 'mensaje-error';
        div.setAttribute('aria-live', 'polite');
        grupo.appendChild(div);
      }
    });
  }

  function validarCampo(campo) {
    const tipo = campo.type;
    const val  = campo.value;

    if (campo.hasAttribute('required') || campo.dataset.validar) {
      if (!REGLAS.requerido(val)) {
        mostrarError(campo, MENSAJES.requerido);
        return false;
      }
    } else if (!val.trim()) {
      limpiar(campo);
      return true;
    }

    if (tipo === 'email') {
      if (!REGLAS.email(val)) { mostrarError(campo, MENSAJES.email); return false; }
    } else if (tipo === 'tel') {
      if (!REGLAS.telefono(val)) { mostrarError(campo, MENSAJES.telefono); return false; }
    } else if (tipo === 'date') {
      if (!REGLAS.fecha(val)) { mostrarError(campo, MENSAJES.fecha); return false; }
    } else if (tipo === 'url') {
      if (!REGLAS.url(val)) { mostrarError(campo, MENSAJES.url); return false; }
    } else if (campo.tagName === 'SELECT') {
      if (!REGLAS.select(val)) { mostrarError(campo, MENSAJES.select); return false; }
    } else if (campo.id === 'fNombre' || campo.id === 'cPersona') {
      if (!REGLAS.nombre(val)) { mostrarError(campo, MENSAJES.nombre); return false; }
    } else if (campo.tagName === 'TEXTAREA' || tipo === 'text') {
      if (val.trim().length > 0 && !REGLAS.texto(val)) {
        mostrarError(campo, MENSAJES.texto); return false;
      }
    }

    mostrarValido(campo);
    return true;
  }

  function validarForm(form) {
    const campos = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    let valido = true;
    campos.forEach(c => { if (!validarCampo(c)) valido = false; });

    // Checkbox de términos si existe
    const checkbox = form.querySelector('#aceptoTerminos');
    if (checkbox && !checkbox.checked) {
      mostrarError(checkbox, 'Debes aceptar los términos y condiciones.');
      valido = false;
    }

    return valido;
  }

  function activarValidacionEnTiempoReal(form) {
    inyectarMensajesError(form);
    form.querySelectorAll('input, select, textarea').forEach(campo => {
      campo.addEventListener('blur', () => validarCampo(campo));
      campo.addEventListener('input', () => {
        if (campo.classList.contains('campo-error')) validarCampo(campo);
      });
    });
  }

  // Validación de fechas (llegada < salida)
  function validarRangoFechas(fLlegada, fSalida) {
    if (!fLlegada?.value || !fSalida?.value) return true;
    const llegada = new Date(fLlegada.value);
    const salida  = new Date(fSalida.value);
    const hoy     = new Date(); hoy.setHours(0, 0, 0, 0);

    if (llegada < hoy) {
      mostrarError(fLlegada, 'La fecha de llegada no puede ser en el pasado.');
      return false;
    }
    if (salida <= llegada) {
      mostrarError(fSalida, 'La fecha de salida debe ser posterior a la de llegada.');
      return false;
    }
    mostrarValido(fLlegada);
    mostrarValido(fSalida);
    return true;
  }

  return { validarForm, activarValidacionEnTiempoReal, validarRangoFechas, mostrarError, mostrarValido, limpiar };
})();


/* ─────────────────────────────────────────
   MÓDULO 5: MODAL DE BONO
   ───────────────────────────────────────── */
const Modal = (() => {
  const overlay  = document.getElementById('modalOverlay');
  const modal    = document.getElementById('modal');
  const btnCerrar = document.getElementById('modalCerrado');
  const form     = document.getElementById('modalForm');
  const btnSubmit = document.getElementById('formSubmit');
  const exito    = document.getElementById('modalExito');
  const qrExito  = document.getElementById('Qr-confirmado');
  const msgExito = document.getElementById('mensajeExito');
  const descBadge = document.getElementById('descuentoInsignia');

  if (form) Validacion.activarValidacionEnTiempoReal(form);

  // Abrir
  function abrir() {
    overlay?.classList.add('modal-abierto');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('fNombre')?.focus(), 350);
  }

  // Cerrar
  function cerrar() {
    overlay?.classList.remove('modal-abierto');
    document.body.style.overflow = '';
  }

  function resetear() {
    form?.classList.remove('oculto');
    exito?.classList.add('oculto');
    form?.querySelectorAll('input, select').forEach(c => {
      c.value = '';
      c.classList.remove('campo-error', 'campo-valido');
    });
  }

  // Cerrar al pulsar overlay
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) cerrar();
  });
  btnCerrar?.addEventListener('click', cerrar);

  // Tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('modal-abierto')) cerrar();
  });

  // Submit del formulario
  btnSubmit?.addEventListener('click', () => {
    const fLlegada = document.getElementById('fLlegada');
    const fSalida  = document.getElementById('fSalida');

    const camposObligatorios = ['fNombre', 'fPais', 'fLlegada', 'fSalida', 'fEmail'];
    let valido = true;

    camposObligatorios.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('required', '');
        if (!Validacion.validarForm(el.closest('form') || form)) valido = false;
      }
    });

    // Revalidar formulario completo
    valido = Validacion.validarForm(form);
    if (!Validacion.validarRangoFechas(fLlegada, fSalida)) valido = false;

    if (!valido) {
      // Scroll al primer error
      const primerError = form.querySelector('.campo-error');
      primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primerError?.focus();
      return;
    }

    // Simular envío
    btnSubmit.textContent = 'Generando...';
    btnSubmit.disabled = true;
    btnSubmit.classList.add('btn-cargando');

    setTimeout(() => {
      const nombre   = document.getElementById('fNombre').value.trim();
      const llegada  = document.getElementById('fLlegada').value;
      const salida   = document.getElementById('fSalida').value;
      const email    = document.getElementById('fEmail').value.trim();
      const codigo   = 'BT-' + Date.now().toString(36).toUpperCase().slice(-6);
      const descuento = Math.floor(Math.random() * 3 + 1) * 10; // 10, 20 o 30 %

      form.classList.add('oculto');
      exito.classList.remove('oculto');

      QRGen.insertar(qrExito, `bono-turista:${codigo}:${email}`, 160);

      msgExito.textContent =
        `¡Hola, ${nombre}! Tu bono #${codigo} es válido del ${fechaLegible(llegada)} al ${fechaLegible(salida)}.`;
      descBadge.textContent = `gid ${descuento}% de descuento activado en establecimientos adheridos`;

      btnSubmit.textContent = 'Generar mi Bono';
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('btn-cargando');
    }, 1800);
  });

  function fechaLegible(iso) {
    const [y, m, d] = iso.split('-');
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
  }

  return { abrir, cerrar, resetear };
})();


/* ─────────────────────────────────────────
   MÓDULO 6: CHATBOT
   ───────────────────────────────────────── */
const Chatbot = (() => {
  const boton    = document.getElementById('chatbotCaja');
  const ventana  = document.getElementById('ventana-chat');
  const cerrar   = document.getElementById('cerrarchat');
  const input    = document.getElementById('chatInput');
  const enviar   = document.getElementById('enviarchat');
  const mensajes = document.getElementById('chatMensaje');
  const insignia = document.querySelector('.insignia-chat');

  let abierto = false;

  // ── Base de conocimiento ──
  const RESPUESTAS = [
    {
      patrones: ['cómo obtengo', 'cómo consigo', 'solicitar', 'obtener'],
      respuesta: '¡Es muy sencillo! Pulsa <strong>"Solicitar mi Bono"</strong> en la pantalla principal, rellena el formulario con tus datos y fechas de viaje y recibirás tu tarjeta Premium con código QR al instante.'
    },
    {
      patrones: ['descuento', 'descuentos', 'cuánto', 'ahorro'],
      respuesta: 'El Bono de Turista ofrece entre un <strong>10% y un 30% de descuento</strong> según el establecimiento: hoteles, supermercados, restaurantes y más. El código QR se actualiza automáticamente con nuevas ofertas.'
    },
    {
      patrones: ['qr', 'código', 'código qr', 'escanear'],
      respuesta: 'Tu código QR es <strong>infinito y dinámico</strong>: cada vez que lo escaneamos lo actualizamos con nuevos destinos, descuentos e información. Solo tienes que mostrarlo en los establecimientos adheridos.'
    },
    {
      patrones: ['hotel', 'alojamiento', 'hostal', 'dormir'],
      respuesta: 'Tenemos acuerdos con los principales hoteles de Malabo y Bata. Muestra tu QR al hacer el check-in para activar tu descuento exclusivo de hasta el 20%.'
    },
    {
      patrones: ['restaurante', 'comer', 'comida', 'bar'],
      respuesta: 'Más de 15 restaurantes y bares en Guinea Ecuatorial están adheridos al programa. Muestra tu Bono al pedir la cuenta y disfruta de descuentos especiales.'
    },
    {
      patrones: ['devolver', 'devolución', 'tarjeta', 'aeropuerto', '500'],
      respuesta: 'Al finalizar tu visita, entrega tu tarjeta física en el mostrador del Bono de Turista en el aeropuerto (Malabo o Bata) y recibirás <strong>500 FCFA de recompensa</strong> inmediatamente.'
    },
    {
      patrones: ['precio', 'coste', 'cuánto cuesta', 'gratis'],
      respuesta: '¡El Bono de Turista es <strong>completamente gratuito</strong>! Solo tienes que reservar tu viaje a través de nuestra plataforma y lo recibirás automáticamente.'
    },
    {
      patrones: ['malabo', 'bata', 'ciudad', 'dónde'],
      respuesta: 'El Bono funciona en todas las regiones turísticas de Guinea Ecuatorial: Malabo, Bata, Mongomo, Annobon y Moca. ¡Explora el país entero con un solo QR!'
    },
    {
      patrones: ['contacto', 'teléfono', 'whatsapp', 'correo', 'email'],
      respuesta: 'Puedes contactarnos en: <strong>+240 222-807-696</strong> |  WhatsApp: +240 222-807-696 | ✉️ info@bono-turista.gq · Atención Lun-Dom de 8:00 a 20:00.'
    },
    {
      patrones: ['hola', 'buenos días', 'buenas', 'saludos'],
      respuesta: '¡Hola! Soy el asistente del <strong>Bono de Turista</strong>. Estoy aquí para ayudarte a sacar el máximo partido a tu visita a Guinea Ecuatorial. ¿En qué puedo ayudarte?'
    },
    {
      patrones: ['gracias', 'perfecto', 'genial', 'ok', 'bien'],
      respuesta: '¡De nada! Si tienes más preguntas sobre el Bono de Turista, estoy aquí.  ¡Que disfrutes Guinea Ecuatorial!'
    },
  ];

  function buscarRespuesta(texto) {
    const normalizado = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const r of RESPUESTAS) {
      if (r.patrones.some(p => normalizado.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
        return r.respuesta;
      }
    }
    return 'Lo siento, no tengo información sobre eso. Puedes contactarnos directamente en <strong>+240 222-807-696</strong> o por WhatsApp y te atenderemos encantados.';
  }

  function agregarMensaje(texto, rol = 'asistente') {
    const div = document.createElement('div');
    div.className = `msg ${rol}`;
    const p = document.createElement('p');
    p.innerHTML = texto;
    div.appendChild(p);
    mensajes?.appendChild(div);
    mensajes?.scrollTo({ top: mensajes.scrollHeight, behavior: 'smooth' });
    return div;
  }

  function mostrarEscribiendo() {
    const div = document.createElement('div');
    div.className = 'msg asistente escribiendo';
    div.innerHTML = '<p><span></span><span></span><span></span></p>';
    mensajes?.appendChild(div);
    mensajes?.scrollTo({ top: mensajes.scrollHeight, behavior: 'smooth' });
    return div;
  }

  function enviarMensaje(texto) {
    texto = texto.trim();
    if (!texto) return;

    agregarMensaje(texto, 'usuario');
    if (input) input.value = '';

    const escribiendo = mostrarEscribiendo();

    setTimeout(() => {
      escribiendo.remove();
      agregarMensaje(buscarRespuesta(texto), 'asistente');
    }, 900 + Math.random() * 600);
  }

  // Eventos
  boton?.addEventListener('click', () => {
    abierto = !abierto;
    ventana?.classList.toggle('chat-abierto', abierto);
    if (abierto) {
      if (insignia) insignia.style.display = 'none';
      input?.focus();
    }
  });

  cerrar?.addEventListener('click', () => {
    abierto = false;
    ventana?.classList.remove('chat-abierto');
  });

  enviar?.addEventListener('click', () => enviarMensaje(input?.value || ''));

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(input.value);
    }
  });

  // Respuestas rápidas
  document.querySelectorAll('.btn-rapido').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('msg-dato') || btn.textContent;
      if (!abierto) {
        abierto = true;
        ventana?.classList.add('chat-abierto');
        if (insignia) insignia.style.display = 'none';
      }
      enviarMensaje(msg);
    });
  });

  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 7: FORMULARIO DE CONTACTO
   ───────────────────────────────────────── */
const Contacto = (() => {
  const btn = document.getElementById('contactSubmit');
  const msg = document.getElementById('mensajeContacto');
  const form = btn?.closest('.contenedor-contacto');

  if (form) Validacion.activarValidacionEnTiempoReal(form);

  btn?.addEventListener('click', () => {
    const campos = form?.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    let valido = true;

    // Validar campos requeridos del contacto
    const requeridos = ['cTelefono', 'cCiudad', 'cMsg', 'cTipo'];
    requeridos.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        Validacion.mostrarError(el, 'Este campo es obligatorio.');
        valido = false;
      }
    });

    const checkbox = document.getElementById('aceptoTerminos');
    if (checkbox && !checkbox.checked) {
      Validacion.mostrarError(checkbox, 'Debes aceptar los términos y condiciones.');
      valido = false;
    }

    if (!valido) {
      const primerError = form?.querySelector('.campo-error');
      primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btn.textContent = 'Enviando...';
    btn.disabled = true;
    btn.classList.add('btn-cargando');

    setTimeout(() => {
      if (msg) {
        msg.style.display = 'block';
        msg.classList.add('visible');
        msg.textContent = '✅ Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.';
      }
      btn.textContent = 'Enviar solicitud';
      btn.disabled = false;
      btn.classList.remove('btn-cargando');

      // Limpiar formulario
      campos?.forEach(c => {
        if (c.type !== 'checkbox') c.value = '';
        c.classList.remove('campo-error', 'campo-valido');
      });
      if (checkbox) checkbox.checked = false;

      setTimeout(() => msg?.classList.remove('visible'), 6000);
    }, 1500);
  });

  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 8: ESTABLECIMIENTOS (JSON dinámico)
   ───────────────────────────────────────── */
const Establecimientos = (() => {
  // Datos de ejemplo (en producción, fetch a /data/establecimientos.json)
  const datos = [
    { nombre: 'Hotel Bahía', tipo: 'Hotel / Alojamiento', icono: '', desc: 'Hotel de 4 estrellas en el corazón de Malabo con vista al mar.', descuento: '20% dto.' },
    { nombre: 'Restaurante La Selva', tipo: 'Restaurante / Bar', icono: '', desc: 'Cocina tradicional ecuatoguineana con ingredientes locales frescos.', descuento: '15% dto.' },
    { nombre: 'Supermercado Central', tipo: 'Supermercado / Tienda', icono: '', desc: 'Gran superficie con productos nacionales e importados en Bata.', descuento: '10% dto.' },
    { nombre: 'Turismo & Aventura GQ', tipo: 'Turismo / Excursiones', icono: '', desc: 'Excursiones por la selva, volcán Pico Basile y playas vírgenes.', descuento: '25% dto.' },
    { nombre: 'Agencia Viajes Ecuatorial', tipo: 'Agencia de viajes', icono: '', desc: 'Vuelos nacionales, transfers y paquetes turísticos personalizados.', descuento: '15% dto.' },
    { nombre: 'ICCEF Cultural', tipo: 'Centro cultural / ICCEF', icono: '', desc: 'Centro de cultura española con eventos, teatro y exposiciones.', descuento: 'Entrada libre' },
    { nombre: 'Taxi Aeroexpress', tipo: 'Transporte', icono: '', desc: 'Servicio de taxi premium aeropuerto-ciudad disponible 24h.', descuento: '10% dto.' },
    { nombre: 'Hotel Ureka', tipo: 'Hotel / Alojamiento', icono: '', desc: 'Complejo hotelero en Bata con piscina y acceso directo a la playa.', descuento: '20% dto.' },
  ];

  const grid = document.getElementById('estabGrid');

  function renderizar() {
    if (!grid) return;
    grid.innerHTML = datos.map(e => `
      <article class="tarjeta-estab" role="article" aria-label="${e.nombre}">
        <div class="estab-icon" aria-hidden="true">${e.icono}</div>
        <div>
          <p class="estab-tipo">${e.tipo}</p>
          <h3 class="estab-nombre">${e.nombre}</h3>
        </div>
        <p class="estab-desc">${e.desc}</p>
        <span class="estab-descuento"> ${e.descuento}</span>
      </article>
    `).join('');
  }

  renderizar();
  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 9: LISTA DE SERVICIOS (QR)
   ───────────────────────────────────────── */
const Servicios = (() => {
  const lista = document.getElementById('lista-Servicios');
  const qrGrande = document.getElementById('qrGrande');
  const tarjetaQR = document.getElementById('ver-qr');
  const qrConfirmado = document.getElementById('Qr-confirmado');

  const items = [
    {   icono:'',titulo: 'Hoteles y alojamiento',    sub: 'Descuentos en más de 8 hoteles adheridos' },
    {   icono:'',titulo: 'Restaurantes y bares',     sub: 'Gastronomía local con precios especiales' },
    {   icono:'',titulo: 'Supermercados',             sub: 'Compra tu día a día con descuento' },
    {   icono:'',titulo: 'Excursiones y turismo',    sub: 'Selva, volcanes y playas vírgenes' },
    {   icono: '', titulo: 'Transporte y traslados',   sub: 'Taxis y agencias al mejor precio' },
    {   icono: '', titulo: 'Info turística en tiempo real', sub: 'QR actualizado con nuevos destinos' },
  ];

  if (lista) {
    lista.innerHTML = items.map(i => `
      <li>
        <span class="serv-icon" aria-hidden="true">${i.icono}</span>
        <div class="serv-texto">
          <strong>${i.titulo}</strong>
          <span>${i.sub}</span>
        </div>
      </li>
    `).join('');
  }

  // QR grande en sección servicios
  if (qrGrande) QRGen.insertar(qrGrande, 'bono-turista.gq/info', 220);

  // QR mini en tarjeta hero
  if (tarjetaQR) QRGen.insertar(tarjetaQR, 'bono-turista.gq', 70);

  return {};
})();


/* ─────────────────────────────────────────
   MÓDULO 10: ANIMACIONES DE SCROLL
   ───────────────────────────────────────── */
const AnimacionScroll = (() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.pasos-targeta, .tarjeta-estab, .lista-servicios li').forEach((el, i) => {
    el.classList.add('animar-entrada');
    el.classList.add(`retraso-${Math.min(i % 5 + 1, 5)}`);
    observer.observe(el);
  });

  return {};
})();


/* ─────────────────────────────────────────
   INIT — Esperar DOM listo
   ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Establecer fecha mínima = hoy en inputs de fecha
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fLlegada')?.setAttribute('min', hoy);
  document.getElementById('fSalida')?.setAttribute('min', hoy);

  // Sincronizar fecha mínima de salida con llegada
  document.getElementById('fLlegada')?.addEventListener('change', function () {
    const salida = document.getElementById('fSalida');
    if (salida && (!salida.value || salida.value <= this.value)) {
      salida.setAttribute('min', this.value);
    }
  });

  console.info(' Bono de Turista · Guinea Ecuatorial — Inicializado correctamente');
});
