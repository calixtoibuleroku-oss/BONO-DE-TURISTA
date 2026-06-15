/* ===== MODAL SOLICITAR BONO – JS ===== */
(async function initModalBono() {
  const resHtml = await fetch('modal-bono/modal-bono.html');
  document.getElementById('modal-bono-root').innerHTML = await resHtml.text();

  const resJson = await fetch('modal-bono/modal-bono.json');
  const config = await resJson.json();

  const overlay  = document.getElementById('modalBono');
  const form     = document.getElementById('modalForm');
  const closeBtn = document.getElementById('modalClose');
  const formMsg  = document.getElementById('modalFormMsg');

  if (!overlay || !form) {
    console.error('[MODAL BONO] Elementos no encontrados en el DOM.');
    return;
  }

  // ── Cerrar modal ──
  function cerrarModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', cerrarModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

  // ── mostrar error de validación ──
  function mostrarError(errId, msg) {
    const el = document.getElementById(errId);
    if (el) el.textContent = msg;
  }
  function limpiarError(errId) {
    const el = document.getElementById(errId);
    if (el) el.textContent = '';
  }
  function marcarInvalido(inputId, invalido) {
    const el = document.getElementById(inputId);
    if (el) el.classList.toggle('invalid', invalido);
  }

  // ── Validar un campo ──
  function validarCampo(campo) {
    const el = document.getElementById(campo.id);
    if (!el) return true;
    const val = el.value.trim();
    limpiarError(campo.errId);
    marcarInvalido(campo.id, false);

    switch (campo.tipo) {
      case 'texto':
        if (!val) {
          mostrarError(campo.errId, config.mensajes.requerido);
          marcarInvalido(campo.id, true);
          return false;
        }
        if (campo.minLen && val.length < campo.minLen) {
          mostrarError(campo.errId, config.mensajes.textoCorto.replace('{min}', campo.minLen));
          marcarInvalido(campo.id, true);
          return false;
        }
        if (campo.maxLen && val.length > campo.maxLen) {
          mostrarError(campo.errId, config.mensajes.textoLargo.replace('{max}', campo.maxLen));
          marcarInvalido(campo.id, true);
          return false;
        }
        return true;

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val) {
          mostrarError(campo.errId, config.mensajes.requerido);
          marcarInvalido(campo.id, true);
          return false;
        }
        if (!emailRegex.test(val)) {
          mostrarError(campo.errId, config.mensajes.emailInvalido);
          marcarInvalido(campo.id, true);
          return false;
        }
        return true;
      }

      case 'select':
        if (!val) {
          mostrarError(campo.errId, config.mensajes.requerido);
          marcarInvalido(campo.id, true);
          return false;
        }
        return true;

      case 'fecha':
        if (!val) {
          mostrarError(campo.errId, config.mensajes.requerido);
          marcarInvalido(campo.id, true);
          return false;
        }
        return true;

      case 'checkbox':
        if (!el.checked) {
          mostrarError(campo.errId, config.mensajes.checkboxRequerido);
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // ── Validación cruzada: fechas ──
  function validarFechas() {
    const llegada = document.getElementById('mLlegada').value;
    const salida  = document.getElementById('mSalida').value;
    if (llegada && salida && salida <= llegada) {
      mostrarError('mSalidaErr', config.mensajes.salidaAnterior);
      marcarInvalido('mSalida', true);
      return false;
    }
    return true;
  }

  // ── Submit ──
  form.addEventListener('submit', async e => {
    e.preventDefault();
    formMsg.style.display = 'none';

    let valido = true;
    config.campos.forEach(c => {
      if (!validarCampo(c)) valido = false;
    });
    if (!validarFechas()) valido = false;

    if (!valido) return;

    // Simular envío
    const submitBtn = document.getElementById('modalSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    await new Promise(r => setTimeout(r, 1200));

    formMsg.textContent = config.mensajes.exito;
    formMsg.className = 'exito';
    formMsg.style.display = 'block';
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Solicitar mi Bono gratis ✦';

    console.info('[MODAL BONO] Formulario enviado correctamente.');
  });

  // Validación en tiempo real
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) {
      el.addEventListener('blur', () => validarCampo(c));
      el.addEventListener('input', () => { limpiarError(c.errId); marcarInvalido(c.id, false); });
    }
  });

  console.info('[MODAL BONO] ✔ Inicializado correctamente.');
})();
