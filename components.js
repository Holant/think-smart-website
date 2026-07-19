(function (window, document) {
  // Hilfsfunktion: Schützt vor fehlerhaftem HTML (z.B. bei Sonderzeichen)
  function esc(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Hilfsfunktion: Führt die Grundeinstellungen und Benutzereinstellungen zusammen
  function merge(base, extra) {
    var out = {};
    var key;
    for (key in base) out[key] = base[key];
    for (key in extra) out[key] = extra[key];
    return out;
  }

  // --- NEU: Liest die aktuelle Sprache aus dem <html lang="..."> Tag ---
  function getHtmlLang() {
    return document.documentElement.lang || 'de'; // Standard ist 'de'
  }

  // --- NEU: Erkennt den Namen der aktuellen Seite (z.B. "aci" aus "aci-en.html") ---
  function getBasePageName() {
    var path = window.location.pathname;
  var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  // Entfernt Endungen, um den "Stamm" zu bekommen
  var baseName = file.replace('-en.html', '').replace('-es.html', '').replace('.html', '');
  return baseName || 'index';
  }

  // Hilfsfunktion: Baut einen einzelnen Sprach-Link (DE, EN, ES)
  function langItem(key, currentLang, href) {
    var label = key.toUpperCase();
    var isActive = key === currentLang;

    if (href) {
      return '<a href="' + esc(href) + '" lang="' + key + '"' +
        (isActive ? ' class="is-active" aria-current="page"' : '') +
        '>' + label + '</a>';
    }
    return '<span class="' + (isActive ? 'is-active is-disabled' : 'is-disabled') + '">' + label + '</span>';
  }

  // Hilfsfunktion: Baut die Navigation für den Sprachwechsler
  function renderLangNav(currentLang, langLinks) {
    return '' +
      '<nav class="ts-lang" aria-label="Sprachen">' +
        langItem('en', currentLang, langLinks.en) +
        '<span class="sep">|</span>' +
        langItem('de', currentLang, langLinks.de) +
        '<span class="sep">|</span>' +
        langItem('es', currentLang, langLinks.es) +
      '</nav>';
  }

  function renderHeader(config) {
    var html = '';
    html += '<header class="ts-header ts-header--' + (config.headerVariant === 'home' ? 'home' : 'subsite') + '">';
    html += '  <div class="ts-shell">';

    if (config.headerVariant === 'home') {
      html += '    <a class="ts-header__logo" href="' + esc(config.homeUrl) + '" aria-label="Zur Startseite">';
      html += '      <img src="' + esc(config.logoSrc) + '" alt="' + esc(config.logoAlt) + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">';
      html += '      <span class="ts-header__logo-fallback">THINK<br>SMART</span>';
      html += '    </a>';
    } else {
      html += '    <div class="ts-header__spacer" aria-hidden="true"></div>';
    }

    html += '    <div class="ts-header__meta">';
    html +=        renderLangNav(config.currentLang, config.langLinks);
    html += '      <a href="#ts-menu" class="ts-burger" aria-label="Menü öffnen">';
    html += '        <span></span><span></span><span></span>';
    html += '      </a>';
    html += '    </div>';
    html += '  </div>';
    html += '</header>';
    return html;
  }

  function renderMenu(config) {
    var items = config.menuItems || [];
    var links = '';
    var i, item, ext, href;
    
    // --- NEU: Bestimme die Endung basierend auf der Sprache ---
    var suffix = (config.currentLang === 'de') ? '' : '-' + config.currentLang;

    for (i = 0; i < items.length; i++) {
      item = items[i];
      ext = item.external ? ' target="_blank" rel="noopener"' : '';
      
      // Baut den Link automatisch zusammen (z.B. aci -> aci-en.html)
      if (item.base) {
        href = item.base + suffix + '.html';
      } else {
        href = item.href; // Fallback, falls du feste URLs nutzt
      }

      links += '<a class="ts-menu-link" href="' + esc(href) + '"' + ext + '>' + esc(item.label) + '</a>';
    }

    return '' +
      '<nav id="ts-menu" class="ts-menu-drawer" aria-label="Seitenmenü">' +
        '<a href="#" class="ts-menu-overlay" aria-label="Menü schließen"></a>' +
        '<div class="ts-menu-panel">' +
          '<a href="#" class="ts-menu-close" aria-label="Menü schließen">×</a>' +
          '<div class="ts-menu-title">Menü</div>' +
          links +
        '</div>' +
      '</nav>';
  }

  function renderFooter(config) {
    return '' +
      '<footer class="ts-footer">' +
        '<div class="ts-shell ts-footer__grid">' +
          '<div class="ts-footer__brand">' +
            '<div class="ts-footer__heading">' + esc(config.companyName) + '</div>' +
            '<p>' + esc(config.slogan) + '</p>' +
          '</div>' +
          '<div class="ts-footer__contact">' +
            '<div class="ts-footer__heading">Contact</div>' +
            '<p><a href="mailto:' + esc(config.contactEmail) + '">' + esc(config.contactEmail) + '</a></p>' +
          '</div>' +
          '<div class="ts-footer__langcol">' +
            '<nav class="ts-footer__lang" aria-label="Sprachen">' +
              langItem('en', config.currentLang, config.langLinks.en) +
              '<span class="sep">|</span>' +
              langItem('de', config.currentLang, config.langLinks.de) +
              '<span class="sep">|</span>' +
              langItem('es', config.currentLang, config.langLinks.es) +
            '</nav>' +
          '</div>' +
          '<div class="ts-footer__bottom">© 2026 ' + esc(config.companyName) + '. All rights reserved. &nbsp;|&nbsp; <a href="' + esc(config.legalNoticeUrl) + '">Legal Notice</a> &nbsp;|&nbsp; <a href="' + esc(config.privacyPolicyUrl) + '">Privacy Policy</a></div>' +
        '</div>' +
      '</footer>';
  }

  function mount(userConfig) {
    // Sprache und Seitenname automatisch erkennen
    var currentLang = getHtmlLang();
    var baseName = getBasePageName();

    // Sprachwechsler-Links automatisch berechnen!
    var autoLangLinks = {
      de: baseName + '.html',
      en: baseName + '-en.html',
      es: baseName + '-es.html'
    };

    // Sonderregel: Legal Notice und Privacy Policy bleiben immer englisch, haben also keine Sprach-Endungen
    if (baseName === 'legal-notice' || baseName === 'privacy-policy') {
      autoLangLinks = { de: baseName + '.html', en: baseName + '.html', es: baseName + '.html' };
    }

    // Logo-Link (Home) automatisch anpassen
    var autoHomeUrl = currentLang === 'de' ? 'index.html' : 'index-' + currentLang + '.html';

       var defaults = {
      headerVariant: 'subsite',
      homeUrl: autoHomeUrl,
      logoSrc: 'assets/TS_Leitlogo.png',
      logoAlt: 'Think Smart Logo',
      companyName: 'Think Smart LLC',
      slogan: 'Intelligence for Change',
      contactEmail: 'hello@think-smart.io',
      legalNoticeUrl: 'legal-notice.html',
      privacyPolicyUrl: 'privacy-policy.html',
      currentLang: currentLang,
      langLinks: autoLangLinks,
      
      // --- ZENTRALES MENÜ ---
      menuItems: [
        { label: 'Home', base: 'index' },
        { label: 'Augmented Collective Intelligence', base: 'aci' },
        { label: 'Augmented Strategy Implementation', base: 'asi' },
        { label: 'Radical Reality Check', base: 'rrc' }
      ].filter(function(item) {
        if (baseName === item.base) {
          return false; 
        }
        return true;
      }),

      menuSlot: '#ts-menu-slot',
      headerSlot: '#ts-header-slot',
      footerSlot: '#ts-footer-slot'
    };

    var config = merge(defaults, userConfig || {});
    var menuSlot = document.querySelector(config.menuSlot);
    var headerSlot = document.querySelector(config.headerSlot);
    var footerSlot = document.querySelector(config.footerSlot);

    if (menuSlot) menuSlot.innerHTML = renderMenu(config);
    if (headerSlot) headerSlot.innerHTML = renderHeader(config);
    if (footerSlot) footerSlot.innerHTML = renderFooter(config);
  }

  window.ThinkSmartComponents = {
    mount: mount
  };
})(window, document);
