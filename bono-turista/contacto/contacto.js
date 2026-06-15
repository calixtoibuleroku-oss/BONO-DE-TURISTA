/* ===== CONTACTO – JS ===== */
(async function initContacto() {
  const resHtml = await fetch('contacto/contacto.html');
  document.getElementById('contacto-root').innerHTML = await resHtml.text();

  const resJson = await fetch('contacto/contacto.json');
  const config = await resJson.json();

  // Renderizar datos de contacto
  const datosEl = document.getElementById('contactoDatos');
  datosEl.innerHTML = config.datos.map(d => `
    <div class="contacto__dato">
      <div class="contacto__dato-icon">${d.icono}</div>
      <div>
        <div class="contacto__dato-label">${d.label}</div>
        <div class="contacto__dato-val">${d.valor}</div>
      </div>
    </div>
  `).join('');

  const form    = document.getElementById('contactoForm');
  const msgEl   = document.getElementById('contactoMsg');
  const charsEl = document.getElementById('cChars');
  const textarea = document.getElementById('cMensaje');
  const { campos, mensajes } = config.validacion;

  // Contador de caracteres
  textarea?.addEventListener('input', () => {
    if (charsEl) charsEl.textContent = textarea.value.length;
  });

  // ── Helpers ──
  function mostrarError(errId, msg) {
    const el = document.getElementById(errId);
    if (el) el.textContent = msg;
  }
  function limpiarError(errId) {
    const el = document.getElementById(errId);
    if (el) el.textContent = '';
  }
  function marcarInvalido(id, invalido) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('invalid', invalido);
  }

  // ── Validar campo ──
  function validarCampo(campo) {
    const el = document.getElementById(campo.id);
    if (!el) return true;
    const val = el.value.trim();
    limpiarError(campo.errId);
    marcarInvalido(campo.id, false);

    if (!val) {
      mostrarError(campo.errId, mensajes.requerido);
      marcarInvalido(campo.id, true);
      return false;
    }
    if (campo.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      mostrarError(campo.errId, mensajes.emailInvalido);
      marcarInvalido(campo.id, true);
      return false;
    }
    if (campo.minLen && val.length < campo.minLen) {
      mostrarError(campo.errId, mensajes.textoCorto.replace('{min}', campo.minLen));
      marcarInvalido(campo.id, true);
      return false;
    }
    return true;
  }

  // ── Validación en tiempo real ──
  campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) {
      el.addEventListener('blur', () => validarCampo(c));
      el.addEventListener('input', () => { limpiarError(c.errId); marcarInvalido(c.id, false); });
    }
  });

  // ── Submit ──
  form.addEventListener('submit', async e => {
    e.preventDefault();
    msgEl.style.display = 'none';

    let valido = true;
    campos.forEach(c => { if (!validarCampo(c)) valido = false; });
    if (!valido) return;

    const submitBtn = form.querySelector('.contacto__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    await new Promise(r => setTimeout(r, 1000));

    msgEl.textContent = mensajes.exito;
    msgEl.className = 'exito';
    msgEl.style.display = 'block';
    form.reset();
    if (charsEl) charsEl.textContent = '0';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar mensaje →';
    console.info('[CONTACTO] Formulario enviado correctamente.');
  });

  console.info('[CONTACTO] ✔ Inicializado correctamente.');
})();
