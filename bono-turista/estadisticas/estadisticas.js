


/* ===== ESTADÍSTICAS – JS ===== */

(async function initEstadisticas() {
  // 1. Cargar HTML shell
  const resHtml = await fetch('estadisticas/estadisticas.html');
  document.getElementById('estadisticas-root').innerHTML = await resHtml.text();

  // 2. Cargar datos JSON
  const resJson = await fetch('estadisticas/estadisticas.json');
  const datos = await resJson.json();

  // 3. Validar datos

  if (!Array.isArray(datos) || datos.length === 0) {
    console.error('[ESTADÍSTICAS] JSON vacío o inválido.');
    return;
  }

  // 4. Renderizar tarjetas

  const grid = document.getElementById('statsGrid');
  grid.innerHTML = datos.map(stat => `
    <div class="stats__card">
      <div class="stats__icon">${stat.icono}</div>
      <div class="stats__value" data-target="${stat.valor}">0<span class="stats__suffix">${stat.sufijo}</span></div>
      <div class="stats__label">${stat.label}</div>
    </div>
  `).join('');


  // 5. Animación contador al entrar en viewport

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stats__value').forEach(el => {
          const target = parseInt(el.dataset.target);
          const suffix = el.querySelector('.stats__suffix')?.outerHTML || '';
          animarContador(el, target, suffix);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const section = document.getElementById('estadisticas');
  if (section) observer.observe(section);

  function animarContador(el, target, suffixHTML) {
    const duracion = 1600;
    const inicio = performance.now();
    function paso(ahora) {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const ease = 1 - Math.pow(1 - progreso, 3);
      el.innerHTML = Math.floor(ease * target) + suffixHTML;
      if (progreso < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  console.info('[ESTADÍSTICAS] ✔ Inicializadas correctamente.');
})();
