/* ===== FOOTER – JS ===== */
(async function initFooter() {
  const resHtml = await fetch('footer/footer.html');
  document.getElementById('footer-root').innerHTML = await resHtml.text();

  const resJson = await fetch('footer/footer.json');
  const data = await resJson.json();

  if (!data || !data.columnas) {
    console.error('[FOOTER] JSON inválido.');
    return;
  }

  // Social
  const socialEl = document.getElementById('footerSocial');
  if (socialEl && data.social) {
    socialEl.innerHTML = data.social.map(s => `
      <a href="${s.url}" class="footer__social-btn" aria-label="${s.label}" target="_blank" rel="noopener noreferrer">
        ${s.icono}
      </a>
    `).join('');
  }

  // Columnas de links

  const linksWrap = document.getElementById('footerLinks');
  if (linksWrap) {
    linksWrap.innerHTML = data.columnas.map(col => `
      <div class="footer__col">
        <div class="footer__col-title">${col.titulo}</div>
        <ul class="footer__col-links">
          ${col.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // COPIA

  const copyEl = document.getElementById('footerCopy');
  if (copyEl) {
    copyEl.textContent = `© ${new Date().getFullYear()} Bono Turista - Guinea Ecuatorial. Todos los derechos reservados.`;
  }

  // Validación: comprobar que el footer existe
  
  const footer = document.querySelector('.footer');
  if (!footer) {
    console.error('[FOOTER] El elemento .footer no se encontró.');
    return;
  }

  console.info('[FOOTER] ✔ Inicializado correctamente.');
})();
