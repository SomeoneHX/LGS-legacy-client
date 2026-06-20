let currentPage = 1;
let currentQuery = '';
let totalPages = 1;

function handleKeyPress(event) {
  if (event.key === 'Enter') performSearch();
}

function performSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) { Swal.fire('提示', '请输入搜索关键词', 'info'); return; }
  currentQuery = query;
  currentPage = 1;
  executeSearch();
}

function executeSearch() {
  const resultsSection = document.getElementById('search-results');
  const resultsContent = document.getElementById('results-content');
  resultsSection.style.display = 'block';
  resultsContent.innerHTML = '<div class="ui active centered inline loader"></div>';
  history.replaceState(null, '', '/search?q=' + encodeURIComponent(currentQuery) + '&page=' + currentPage);
  api.get('/search/articles?q=' + encodeURIComponent(currentQuery) + '&page=' + currentPage + '&limit=20')
    .then(function (data) {
      const hits = data.hits || [];
      totalPages = Math.ceil((data.total || hits.length) / 20) || 1;
      renderResults(hits);
      renderPagination();
    })
    .catch(function (err) {
      showError('搜索失败: ' + (err.message || '请稍后重试'));
    });
}

function renderResults(results) {
  const container = document.getElementById('results-content');
  if (results.length === 0) {
    container.innerHTML = '<div class="ui icon message"><i class="search icon"></i><div class="content"><div class="header">没有找到相关结果</div><p>请尝试使用其他关键词搜索</p></div></div>';
    document.getElementById('pagination').style.display = 'none';
    return;
  }
  let html = '<div class="ui divided items">';
  results.forEach(function (item) {
    html += '<div class="item"><div class="content"><a class="header" style="color:#1e70bf" href="/article/' + item.id + '">' + (item.title || '无标题') + '</a><div class="meta firacode"><span><i class="fa fa-hashtag"></i> ' + item.id + '</span><span><i class="fa fa-user"></i> UID: ' + (item.author_uid || '') + '</span><span><i class="fa fa-clock"></i> ' + (item.updated_at || '') + '</span></div></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderPagination() {
  const paginationSection = document.getElementById('pagination');
  const paginationContent = document.getElementById('pagination-content');
  if (totalPages <= 1) { paginationSection.style.display = 'none'; return; }
  paginationSection.style.display = 'block';
  let html = '<div class="ui pagination menu">';
  if (currentPage > 1) html += '<a class="item" onclick="changePage(' + (currentPage - 1) + ')"><i class="left chevron icon"></i></a>';
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  for (let i = startPage; i <= endPage; i++) {
    html += '<a class="item ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</a>';
  }
  if (currentPage < totalPages) html += '<a class="item" onclick="changePage(' + (currentPage + 1) + ')"><i class="right chevron icon"></i></a>';
  html += '</div>';
  paginationContent.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  executeSearch();
}

function showError(message) {
  const resultsContent = document.getElementById('results-content');
  resultsContent.innerHTML = '<div class="ui negative message"><i class="exclamation triangle icon"></i> ' + message + '</div>';
  document.getElementById('pagination').style.display = 'none';
}

async function pageSearch() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header"><span><i class="ui search icon colored"></i>专栏搜索</span><div class="sub header" style="margin-top: 10px;">搜索标题、内容、UID · 文章数据每小时同步一次</div></h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <div class="ui icon fluid input">
            <input type="text" id="search-input" placeholder="标题 / 内容 / 作者 UID" onkeypress="handleKeyPress(event)">
            <i class="inverted circular search link icon" onclick="performSearch()"></i>
          </div>
        </div>
        <div id="search-results" class="card shadow outline" style="display: none;">
          <h3 class="ui dividing header"><i class="list icon"></i> 搜索结果</h3>
          <div id="results-content"></div>
        </div>
        <div id="pagination" class="card shadow padding-10" style="display: none; text-align: center;">
          <div id="pagination-content"></div>
        </div>
      </div>
    </div>`;

  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const page = parseInt(params.get('page'), 10) || 1;
  if (query) {
    const input = document.getElementById('search-input');
    input.value = query;
    currentQuery = query;
    currentPage = page;
    executeSearch();
  }
}
