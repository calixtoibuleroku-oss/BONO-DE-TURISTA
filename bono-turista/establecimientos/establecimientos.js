/* ===== ESTABLECIMIENTOS – JS ===== */
(async function initEstablecimientos() {
  const resHtml = await fetch('establecimientos/establecimientos.html');
  document.getElementById('establecimientos-root').innerHTML = await resHtml.text();

  const resJson = await fetch('establecimientos/establecimientos.json');
  const data = await resJson.json();

  if (!Array.isArray(data) || data.length === 0) {
    console.error('[ESTABLECIMIENTOS] JSON vacío o inválido.');
    return;
  }

  // Tipos únicos para filtros
  const tipos = ['todos', ...new Set(data.map(e => e.tipo))];
  const filtrosEl = document.getElementById('filtros');
  filtrosEl.innerHTML = tipos.map(t => `
    <button class="filtro-btn ${t === 'todos' ? 'active' : ''}" data-tipo="${t}">
      ${t.charAt(0).toUpperCase() + t.slice(1)}
    </button>
  `).join('');

  // Render cards
  const grid = document.getElementById('estGrid');
  function renderCards(filtro) {
    const lista = filtro === 'todos' ? data : data.filter(e => e.tipo === filtro);
    grid.innerHTML = lista.map(e => `
      <div class="est-card ${e.destacado ? 'destacado' : ''}" data-tipo="${e.tipo}">
        ${e.destacado ? '<span class="est-card__badge">★ DESTACADO</span>' : ''}
        <div class="est-card__icon">${e.icono}</div>
        <div class="est-card__nombre">${e.nombre}</div>
        <div class="est-card__ciudad">📍 ${e.ciudad}</div>
        <div class="est-card__descuento">${e.descuento} dto.</div>
      </div>
    `).join('');
  }
  renderCards('todos');

  // Filtros click
  filtrosEl.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filtrosEl.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.dataset.tipo);
    });
  });

  console.info('[ESTABLECIMIENTOS] ✔ Inicializados correctamente.');
})();
