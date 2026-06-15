/* ===== NAVEGACIÓN – JS ===== */
(async function initNavegacion() {
  // Cargar HTML
  const res = await fetch('navegacion/navegacion.html');
  const html = await res.text();
  document.getElementById('navegacion-root').innerHTML = html;

  const nav       = document.getElementById('mainNav');
  const burger    = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');
  const ctaBtn    = document.getElementById('navCtaBtn');
  const mobileCtaBtn = document.getElementById('navMobileCtaBtn');
  const navLinks  = document.querySelectorAll('.nav__link');

 
  // ── Hamburger ──
  burger.addEventListener('click', () => {
    const abierto = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', abierto);
    burger.setAttribute('aria-expanded', abierto);
  });

  // Cerrar mobile al hacer clic en un link
  
  mobileMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // ── CTA → abrir modal ──

  function abrirModal() {
    const modal = document.getElementById('modalBono');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }
  if (ctaBtn)     ctaBtn.addEventListener('click', abrirModal);
  if (mobileCtaBtn) mobileCtaBtn.addEventListener('click', abrirModal);

  // ── Resaltar link activo al hacer scroll ──
  function actualizarLinkActivo() {
    const secciones = ['hero','como-funciona','servicios','establecimientos','contacto'];
    const scrollY = window.scrollY + 90;
    let activa = 'hero';
    secciones.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) activa = id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activa}`);
    });
  }

  // ── Validación: comprobar que el elemento nav existe en el DOM ──
  if (!nav) {
    console.error('[NAVEGACIÓN] El elemento #mainNav no se encontró en el DOM.');
    return;
  }
  console.info('[NAVEGACIÓN] ✔ Inicializada correctamente.');
})();
