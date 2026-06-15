/* ===== CÓMO FUNCIONA – JS ===== */
(async function initComoFunciona() {
  const resHtml = await fetch('como-funciona/como-funciona.html');
  document.getElementById('como-funciona-root').innerHTML = await resHtml.text();

  const resJson = await fetch('como-funciona/como-funciona.json');
  const pasos = await resJson.json();

  // Validación
  if (!Array.isArray(pasos) || pasos.length === 0) {
    console.error('[CÓMO FUNCIONA] JSON vacío o inválido.');
    return;
  }

  const container = document.getElementById('comoFuncionaSteps');
  container.innerHTML = pasos.map(paso => `
    <div class="step fade-up">
      <span class="step__num">${paso.numero}</span>
      <div class="step__num-icon">
        <div class="step__circle">${paso.icono}</div>
      </div>
      <h3 class="step__title">${paso.titulo}</h3>
      <p class="step__desc">${paso.descripcion}</p>
    </div>
  `).join('');

  // Animación al entrar viewport
  const steps = container.querySelectorAll('.step');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }, i * 120);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  steps.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(24px)';
    obs.observe(s);
  });

  // CTA → abrir modal
  document.getElementById('comoFuncionaCtaBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('modalBono');
    if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
  });

  console.info('[CÓMO FUNCIONA] ✔ Inicializado correctamente.');
})();
