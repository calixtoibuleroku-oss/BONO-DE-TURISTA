/* ===== HERO – JS ===== */
(async function initHero() {
  const res  = await fetch('hero/hero.html');
  const html = await res.text();
  document.getElementById('hero-root').innerHTML = html;

  // CTA → abrir modal
  const ctaBtn = document.getElementById('heroCtaBtn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const modal = document.getElementById('modalBono');
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  
  // Validación básica: sección hero visible
  
  const hero = document.getElementById('hero');
  if (!hero) {
    console.error('[HERO] La sección #hero no se encontró.');
    return;
  }
  console.info('[HERO] ✔ Inicializado correctamente.');
})();
