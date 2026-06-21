let loadedArticleIds = [];
let isLoading = false;
let hasMore = true;

async function pagePlaza() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header">
            <span><i class="ui globe icon colored"></i> 文章广场</span>
            <div class="sub header" style="margin-top: 10px;">发现精彩专栏内容</div>
          </h1>
        </div>
      </div>
    </div>
    <div class="ui grid" id="plaza-list"></div>
    <div class="ui grid" id="plaza-load-more"></div>`;

  loadedArticleIds = [];
  isLoading = false;
  hasMore = true;
  await loadMoreArticles();
}

async function loadMoreArticles() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  const loadMoreEl = document.getElementById('plaza-load-more');
  loadMoreEl.innerHTML = '<div class="sixteen wide column" style="text-align:center;padding:20px 0;"><div class="ui active inline mini loader"></div> 加载中...</div>';

  try {
    const excludeIds = loadedArticleIds.join(',');
    const data = await api.get('/plaza/get?count=20' + (excludeIds ? '&exclude=' + excludeIds : ''));
    const articles = Array.isArray(data) ? data : [];

    if (loadedArticleIds.length === 0) {
      document.getElementById('plaza-list').innerHTML = '';
    }

    if (articles.length === 0) {
      hasMore = false;
      const listEl = document.getElementById('plaza-list');
      if (listEl.children.length === 0) {
        listEl.innerHTML = '<div class="sixteen wide column"><div class="card shadow outline" style="text-align:center;padding:50px 0;"><i class="ui icon inbox" style="font-size:3rem;color:gray;"></i><div style="font-size:1.5rem;color:gray;margin-top:10px;">暂无推荐</div></div></div>';
      } else {
        loadMoreEl.innerHTML = '<div class="sixteen wide column" style="text-align:center;color:gray;padding:20px;"><i class="ui icon inbox"></i> 没有更多推荐了</div>';
      }
      return;
    }

    loadedArticleIds.push(...articles.map(function (a) { return a.id; }));
    renderArticles(articles);

    if (articles.length < 20) {
      hasMore = false;
      loadMoreEl.innerHTML = '<div class="sixteen wide column" style="text-align:center;color:gray;padding:20px;"><i class="ui icon inbox"></i> 没有更多推荐了</div>';
    } else {
      loadMoreEl.innerHTML = '<div class="sixteen wide column" style="text-align:center;padding:20px 0;"><button class="ui basic button" onclick="loadMoreArticles()"><i class="ui icon arrow down"></i> 加载更多</button></div>';
    }
  } catch (err) {
    const listEl = document.getElementById('plaza-list');
    if (loadedArticleIds.length === 0) {
      listEl.innerHTML = '<div class="sixteen wide column"><div class="card shadow" style="text-align:center;padding:50px 0;"><i class="ui icon warning circle" style="font-size:3rem;color:red;"></i><div style="color:gray;margin-top:10px;">加载失败: ' + (err.message || '未知错误') + '</div><button class="ui primary button" style="margin-top:15px;" onclick="loadMoreArticles()"><i class="ui icon refresh"></i> 重试</button></div></div>';
    } else {
      loadMoreEl.innerHTML = '<div class="sixteen wide column" style="text-align:center;padding:20px 0;"><div class="ui negative message"><i class="exclamation triangle icon"></i> 加载失败: ' + (err.message || '请稍后重试') + '</div><button class="ui basic button" onclick="loadMoreArticles()"><i class="ui icon refresh"></i> 重试</button></div>';
    }
  } finally {
    isLoading = false;
  }
}

function renderArticles(articles) {
  const container = document.getElementById('plaza-list');
  const catNames = { 1: '个人记录', 2: '题解', 3: '科技·工程', 4: '算法·理论', 5: '生活·游记', 6: '学习·文化课', 7: '休闲·娱乐', 8: '闲话' };

  var html = '';
  articles.forEach(function (a) {
    const author = a.author || {};
    var reasonBadge = '';
    if (a.reason === 'hot') {
      reasonBadge = '<span class="ui red label"><i class="fas fa-fire"></i> 热门</span> ';
    } else if (a.reason === 'vector') {
      reasonBadge = '<span class="ui blue label"><i class="fas fa-magic"></i> 猜你想看</span> ';
    }

    html += '<div class="sixteen wide column"><div class="card shadow outline"><div style="display: flex; flex: 1;"><div><div style="width: 70px;" class="meta user"><img class="ui circular image" src="https://cdn.luogu.com.cn/upload/usericon/' + (author.id || 3) + '.png" alt="' + (author.name || '') + '"></div></div><div style="margin-left: 20px; flex: 1;"><a class="article-title" href="/article/' + a.id + '" style="color:#2c3e50;font-size:1.4em;font-weight:700;">' + (a.title || '无标题') + '</a><div class="article-author" style="margin-top:10px;font-size:1.15em;">@<a href="/user/' + (author.id || '') + '" class="user-' + (author.color || 'Gray') + '">' + (author.name || '未知') + '</a></div><div class="article-meta meta gray" style="margin-top:3px;"><i class="fas fa-calendar-alt"></i> <span>最后更新于 ' + (a.updatedAt || '') + '</span></div>' + (a.summary ? '<div class="article-summary" style="margin-top:12px;">' + a.summary + '</div>' : '') + '<div class="article-tags" style="margin-top:10px;">' + reasonBadge + '<span class="ui orange label"><i class="fas fa-th"></i> ' + (catNames[a.category] || '未知分类') + '</span></div></div></div></div></div>';
  });
  container.insertAdjacentHTML('beforeend', html);
}
