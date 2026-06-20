document.addEventListener('DOMContentLoaded', async function () {
  initAuth();

  const siteStartDate = new Date('2025-02-12T00:00:00Z');
  const now = new Date();
  const daysRunning = Math.floor((now - siteStartDate) / (1000 * 60 * 60 * 24));
  const daysEl = document.getElementById('site-days');
  if (daysEl) daysEl.textContent = daysRunning;

  registerRoute('/', pageHome);
  registerRoute('/article/recent', pageRecent);
  registerRoute('/article/:id', pageArticle);
  registerRoute('/paste/:id', pagePaste);
  registerRoute('/user/:id', pageUser);
  registerRoute('/search', pageSearch);
  registerRoute('/statistic', pageStatistic);
  registerRoute('/task/:id', pageTask);
  registerRoute('/admin', pageAdmin);
  registerRoute('/settings', pageSettings);
  registerRoute('/about', pageAbout);
  registerRoute('/legal/privacy', pageLegal);
  registerRoute('/legal/disclaimer', pageLegal);
  registerRoute('/legal/deletion', pageLegal);

  initRouter();

  const sidebarItems = document.querySelectorAll('.accordion-title');
  sidebarItems.forEach(function (title) {
    title.addEventListener('click', function (e) {
      e.preventDefault();
      const content = this.nextElementSibling;
      if (content && content.classList.contains('accordion-content')) {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        this.classList.toggle('active');
      }
    });
  });
});
