(function () {
  function getLang() {
    return document.documentElement.lang || 'de';
  }

  function formatDate(dateStr, lang) {
    var d = new Date(dateStr);
    var months = {
      de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    };
    var m = months[lang] || months.de;
    return d.getDate() + '. ' + m[d.getMonth()] + ' ' + d.getFullYear();
  }

  function tagLabel(tag, lang) {
    var labels = {
      de: { rrc: 'Radical Reality Check', aci: 'Collective Intelligence', asi: 'Strategy Implementation', intelligence: 'Intelligence' },
      en: { rrc: 'Radical Reality Check', aci: 'Collective Intelligence', asi: 'Strategy Implementation', intelligence: 'Intelligence' },
      es: { rrc: 'Radical Reality Check', aci: 'Inteligencia Colectiva', asi: 'Implementación de Estrategia', intelligence: 'Inteligencia' }
    };
    return (labels[lang] || labels.de)[tag] || tag;
  }

  function readMoreLabel(lang) {
    return { de: 'Weiterlesen', en: 'Read more', es: 'Leer más' }[lang] || 'Weiterlesen';
  }

  function renderCard(post, lang) {
    var title = post.title[lang] || post.title.de;
    var teaser = post.teaser[lang] || post.teaser.de;
    var url = (post.url && post.url[lang]) || '#';
    var date = formatDate(post.date, lang);
    var tags = post.tags.map(function (t) {
      return '<span class="blog-card-tag">' + tagLabel(t, lang) + '</span>';
    }).join('');

    return '<article class="blog-card">' +
      '<div class="blog-card-date">' + date + '</div>' +
      '<h3 class="blog-card-title">' + title + '</h3>' +
      '<p class="blog-card-teaser">' + teaser + '</p>' +
      '<div class="blog-card-tags">' + tags + '</div>' +
      '<a href="' + url + '" class="blog-card-link">' + readMoreLabel(lang) + ' →</a>' +
      '</article>';
  }

  function renderOverview() {
    var grid = document.getElementById('blog-grid');
    if (!grid || !window.BlogPosts) return;

    var lang = getLang();
    var posts = window.BlogPosts.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = posts.map(function (p) {
      return renderCard(p, lang);
    }).join('');

    var filters = document.querySelectorAll('.blog-filter');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (f) { f.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.dataset.filter;
        var cards = grid.querySelectorAll('.blog-card');
        cards.forEach(function (card, i) {
          if (filter === 'all' || posts[i].tags.indexOf(filter) !== -1) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function renderWidgets() {
    var containers = document.querySelectorAll('[data-blog-latest]');
    if (!containers.length || !window.BlogPosts) return;

    var lang = getLang();

    containers.forEach(function (container) {
      var tag = container.dataset.tag;
      var posts = window.BlogPosts.filter(function (p) {
        return p.tags.indexOf(tag) !== -1;
      }).sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }).slice(0, 3);

      container.innerHTML = posts.map(function (p) {
        return renderCard(p, lang);
      }).join('');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderOverview();
      renderWidgets();
    });
  } else {
    renderOverview();
    renderWidgets();
  }
})();
