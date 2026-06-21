const routes = [];

function registerRoute(pattern, handler) {
  routes.push({ pattern, handler });
}

function matchRoute(path) {
  path = path.replace(/\/+$/, '') || '/';
  for (const route of routes) {
    const paramNames = [];
    const regexStr = route.pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp('^' + regexStr + '$');
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => params[name] = decodeURIComponent(match[i + 1]));
      return { handler: route.handler, params };
    }
  }
  return null;
}

function navigate(path, replace) {
  const base = window.__BASE_PATH__ || '';
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }
  const resolved = base + path;
  if (replace) {
    history.replaceState(null, '', resolved);
  } else {
    history.pushState(null, '', resolved);
  }
  handleRoute(path);
}

function handleRoute(path) {
  const base = window.__BASE_PATH__ || '';
  const cleanPath = base && path.startsWith(base) ? path.slice(base.length) || '/' : path;
  const pathname = cleanPath.split('?')[0];
  const match = matchRoute(pathname);
  const pageContent = document.getElementById('page-content');
  if (match) {
    match.handler(match.params);
  } else {
    show404();
  }
}

function show404() {
  const el = document.getElementById('page-content');
  const base = window.__BASE_PATH__ || '';
  el.innerHTML = '<div class="ui grid"><div class="sixteen wide column"><div class="card shadow" style="text-align:center;padding:80px 30px;"><i class="ui icon frown" style="font-size:4rem;color:gray;"></i><h1 style="color:gray;margin-top:20px;">404 - 页面未找到</h1><p style="color:gray;">您访问的页面不存在</p><a href="' + base + '/" class="ui primary button" style="margin-top:20px;"><i class="ui icon home"></i> 返回主页</a></div></div></div>';
}

function initRouter() {
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || a.hasAttribute('target') || a.hasAttribute('download') || 'noSpa' in a.dataset) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', function () {
    handleRoute(location.pathname + location.search);
  });

  handleRoute(location.pathname + location.search);
}
